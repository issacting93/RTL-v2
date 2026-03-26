import React, { useState, useMemo } from 'react';

interface ThematicCluster {
  label: string;
  x: number;
  y: number;
  size: number;
  color?: string;
}

interface ThematicMapProps {
  clusters: ThematicCluster[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  quadrantLabels?: [string, string, string, string];
  onClusterClick?: (label: string) => void;
}

const DEFAULT_QUADRANT_LABELS: [string, string, string, string] = [
  'Motor Themes',
  'Niche Themes',
  'Basic Themes',
  'Emerging/Declining',
];

const ThematicMap: React.FC<ThematicMapProps> = ({
  clusters,
  width = 600,
  height = 500,
  xLabel = 'Centrality',
  yLabel = 'Density',
  quadrantLabels = DEFAULT_QUADRANT_LABELS,
  onClusterClick,
}) => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const layout = useMemo(() => {
    if (clusters.length === 0) {
      return { medianX: 0, medianY: 0, scaleX: () => 0, scaleY: () => 0, bubbles: [] };
    }

    const xVals = clusters.map((c) => c.x).sort((a, b) => a - b);
    const yVals = clusters.map((c) => c.y).sort((a, b) => a - b);

    const medianX = xVals.length % 2 === 0
      ? (xVals[xVals.length / 2 - 1] + xVals[xVals.length / 2]) / 2
      : xVals[Math.floor(xVals.length / 2)];
    const medianY = yVals.length % 2 === 0
      ? (yVals[yVals.length / 2 - 1] + yVals[yVals.length / 2]) / 2
      : yVals[Math.floor(yVals.length / 2)];

    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);
    const yMin = Math.min(...yVals);
    const yMax = Math.max(...yVals);

    const xPad = (xMax - xMin) * 0.15 || 1;
    const yPad = (yMax - yMin) * 0.15 || 1;

    const scaleX = (v: number) =>
      ((v - (xMin - xPad)) / (xMax - xMin + 2 * xPad)) * innerWidth;
    const scaleY = (v: number) =>
      innerHeight - ((v - (yMin - yPad)) / (yMax - yMin + 2 * yPad)) * innerHeight;

    const maxSize = Math.max(...clusters.map((c) => c.size));
    const sizeScale = maxSize > 0 ? 40 / Math.sqrt(maxSize) : 1;

    const bubbles = clusters.map((c) => ({
      ...c,
      cx: scaleX(c.x),
      cy: scaleY(c.y),
      r: Math.max(6, Math.sqrt(c.size) * sizeScale),
    }));

    return {
      medianX: scaleX(medianX),
      medianY: scaleY(medianY),
      scaleX,
      scaleY,
      bubbles,
    };
  }, [clusters, innerWidth, innerHeight]);

  return (
    <svg width={width} height={height} style={{ background: '#fafafa' }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Quadrant background labels */}
        {/* Top-right: Motor Themes */}
        <text
          x={layout.medianX + (innerWidth - layout.medianX) / 2}
          y={layout.medianY / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#ccc"
          fontStyle="italic"
        >
          {quadrantLabels[0]}
        </text>
        {/* Top-left: Niche Themes */}
        <text
          x={layout.medianX / 2}
          y={layout.medianY / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#ccc"
          fontStyle="italic"
        >
          {quadrantLabels[1]}
        </text>
        {/* Bottom-right: Basic Themes */}
        <text
          x={layout.medianX + (innerWidth - layout.medianX) / 2}
          y={layout.medianY + (innerHeight - layout.medianY) / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#ccc"
          fontStyle="italic"
        >
          {quadrantLabels[2]}
        </text>
        {/* Bottom-left: Emerging/Declining */}
        <text
          x={layout.medianX / 2}
          y={layout.medianY + (innerHeight - layout.medianY) / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#ccc"
          fontStyle="italic"
        >
          {quadrantLabels[3]}
        </text>

        {/* Crosshair lines */}
        <line
          x1={layout.medianX}
          y1={0}
          x2={layout.medianX}
          y2={innerHeight}
          stroke="#bbb"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <line
          x1={0}
          y1={layout.medianY}
          x2={innerWidth}
          y2={layout.medianY}
          stroke="#bbb"
          strokeWidth={1}
          strokeDasharray="4,4"
        />

        {/* Axes border */}
        <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#999" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#999" strokeWidth={1} />

        {/* Bubbles */}
        {layout.bubbles.map((b) => (
          <g key={b.label}>
            <circle
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill={b.color || '#4a90d9'}
              fillOpacity={0.7}
              stroke={b.color || '#4a90d9'}
              strokeWidth={1.5}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredLabel(b.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onClick={() => onClusterClick?.(b.label)}
            />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredLabel &&
          (() => {
            const b = layout.bubbles.find((bb) => bb.label === hoveredLabel);
            if (!b) return null;
            const tw = b.label.length * 7 + 16;
            return (
              <g pointerEvents="none">
                <rect
                  x={b.cx - tw / 2}
                  y={b.cy - b.r - 28}
                  width={tw}
                  height={22}
                  rx={4}
                  fill="#333"
                  fillOpacity={0.9}
                />
                <text
                  x={b.cx}
                  y={b.cy - b.r - 14}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#fff"
                  dy="0.35em"
                >
                  {b.label}
                </text>
              </g>
            );
          })()}

        {/* X axis label */}
        <text
          x={innerWidth / 2}
          y={innerHeight + 36}
          textAnchor="middle"
          fontSize={13}
          fill="#555"
        >
          {xLabel}
        </text>

        {/* Y axis label */}
        <text
          x={-innerHeight / 2}
          y={-42}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize={13}
          fill="#555"
        >
          {yLabel}
        </text>
      </g>
    </svg>
  );
};

export default ThematicMap;
