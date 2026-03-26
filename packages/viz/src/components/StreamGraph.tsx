import React, { useMemo, useState } from 'react';

interface StreamLayer {
  label: string;
  values: number[];
  color: string;
}

interface StreamGraphProps {
  layers: StreamLayer[];
  segmentLabels?: string[];
  width?: number;
  height?: number;
  onLayerClick?: (label: string) => void;
  baseline?: 'zero' | 'center' | 'wiggle';
}

const MARGIN = { top: 10, right: 10, bottom: 30, left: 10 };

/**
 * Compute baseline offsets for each segment index.
 * - 'zero': all layers stacked from y=0 upward
 * - 'center': center the stack around the midpoint (silhouette)
 * - 'wiggle': minimize weighted wiggle (streamgraph)
 */
function computeBaselines(
  layers: StreamLayer[],
  mode: 'zero' | 'center' | 'wiggle',
): number[] {
  if (layers.length === 0) return [];
  const n = layers[0].values.length;
  const baselines = new Array<number>(n).fill(0);

  if (mode === 'zero') {
    return baselines;
  }

  if (mode === 'center') {
    for (let j = 0; j < n; j++) {
      let total = 0;
      for (const layer of layers) {
        total += layer.values[j] ?? 0;
      }
      baselines[j] = -total / 2;
    }
    return baselines;
  }

  // 'wiggle' baseline (simplified streamgraph offset)
  const m = layers.length;
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < m; i++) {
      let wiggle = 0;
      for (let k = 0; k < i; k++) {
        wiggle += layers[k].values[j] ?? 0;
      }
      wiggle += (layers[i].values[j] ?? 0) / 2;
      sum += wiggle;
    }
    baselines[j] = -(sum / m);
  }

  return baselines;
}

export const StreamGraph: React.FC<StreamGraphProps> = ({
  layers,
  segmentLabels,
  width = 600,
  height = 300,
  onLayerClick,
  baseline = 'center',
}) => {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  const { paths, xPositions } = useMemo(() => {
    if (layers.length === 0 || layers[0].values.length === 0) {
      return { paths: [], xPositions: [] };
    }

    const plotW = width - MARGIN.left - MARGIN.right;
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const n = layers[0].values.length;

    const baselines = computeBaselines(layers, baseline);

    // Build cumulative stacks at each segment
    // stack[j] = array of { y0, y1 } per layer at segment j
    const stack: { y0: number; y1: number }[][] = [];
    for (let j = 0; j < n; j++) {
      let cumulative = baselines[j];
      const col: { y0: number; y1: number }[] = [];
      for (const layer of layers) {
        const val = layer.values[j] ?? 0;
        col.push({ y0: cumulative, y1: cumulative + val });
        cumulative += val;
      }
      stack.push(col);
    }

    // Find y extent for scaling
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const col of stack) {
      for (const band of col) {
        if (band.y0 < yMin) yMin = band.y0;
        if (band.y1 > yMax) yMax = band.y1;
      }
    }
    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    }

    const xScale = (j: number) =>
      MARGIN.left + (n > 1 ? (j / (n - 1)) * plotW : plotW / 2);
    const yScale = (v: number) =>
      MARGIN.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    const xPos = Array.from({ length: n }, (_, j) => xScale(j));

    // Build SVG path for each layer
    const layerPaths = layers.map((layer, layerIdx) => {
      // Top edge: left to right
      const topPoints: string[] = [];
      for (let j = 0; j < n; j++) {
        const x = xPos[j];
        const y = yScale(stack[j][layerIdx].y1);
        topPoints.push(`${j === 0 ? 'M' : 'L'} ${x} ${y}`);
      }

      // Bottom edge: right to left
      const bottomPoints: string[] = [];
      for (let j = n - 1; j >= 0; j--) {
        const x = xPos[j];
        const y = yScale(stack[j][layerIdx].y0);
        bottomPoints.push(`L ${x} ${y}`);
      }

      const d = topPoints.join(' ') + ' ' + bottomPoints.join(' ') + ' Z';

      return {
        label: layer.label,
        color: layer.color,
        d,
      };
    });

    return { paths: layerPaths, xPositions: xPos };
  }, [layers, width, height, baseline]);

  const numSegments = layers.length > 0 ? layers[0].values.length : 0;

  return (
    <svg
      width={width}
      height={height}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Render layers in order (bottom to top visually) */}
      {paths.map((p) => {
        const isHovered = hoveredLayer === p.label;
        return (
          <path
            key={p.label}
            d={p.d}
            fill={p.color}
            style={{
              opacity: hoveredLayer === null ? 0.8 : isHovered ? 1 : 0.4,
              cursor: onLayerClick ? 'pointer' : 'default',
              transition: 'opacity 0.15s',
            }}
            onClick={() => onLayerClick?.(p.label)}
            onMouseEnter={() => setHoveredLayer(p.label)}
            onMouseLeave={() => setHoveredLayer(null)}
          >
            <title>{p.label}</title>
          </path>
        );
      })}

      {/* X-axis labels */}
      {xPositions.map((x, i) => {
        const label = segmentLabels?.[i] ?? String(i);
        // Show a subset of labels to avoid crowding
        const showLabel =
          numSegments <= 12 ||
          i === 0 ||
          i === numSegments - 1 ||
          i % Math.ceil(numSegments / 10) === 0;
        if (!showLabel) return null;
        return (
          <text
            key={i}
            x={x}
            y={height - MARGIN.bottom + 16}
            textAnchor="middle"
            style={{ fontSize: 10, fill: '#64748b' }}
          >
            {label}
          </text>
        );
      })}

      {/* Bottom axis line */}
      <line
        x1={MARGIN.left}
        y1={height - MARGIN.bottom}
        x2={width - MARGIN.right}
        y2={height - MARGIN.bottom}
        stroke="#cbd5e1"
        strokeWidth={1}
      />
    </svg>
  );
};

export default StreamGraph;
