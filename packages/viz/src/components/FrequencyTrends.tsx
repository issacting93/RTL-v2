import React, { useMemo, useState } from 'react';

interface TrendSeries {
  label: string;
  values: number[];
  color: string;
}

interface FrequencyTrendsProps {
  series: TrendSeries[];
  segmentLabels?: string[];
  width?: number;
  height?: number;
  onPointClick?: (seriesLabel: string, segmentIndex: number) => void;
}

const MARGIN = { top: 40, right: 20, bottom: 40, left: 50 };

export const FrequencyTrends: React.FC<FrequencyTrendsProps> = ({
  series,
  segmentLabels,
  width = 600,
  height = 300,
  onPointClick,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    series: string;
    index: number;
  } | null>(null);

  const { yMax, numSegments, xScale, yScale, gridLines } = useMemo(() => {
    let maxVal = 0;
    let maxLen = 0;
    for (const s of series) {
      for (const v of s.values) {
        if (v > maxVal) maxVal = v;
      }
      if (s.values.length > maxLen) maxLen = s.values.length;
    }
    if (maxVal === 0) maxVal = 1;

    const plotW = width - MARGIN.left - MARGIN.right;
    const plotH = height - MARGIN.top - MARGIN.bottom;

    const xScaleFn = (i: number) =>
      MARGIN.left + (maxLen > 1 ? (i / (maxLen - 1)) * plotW : plotW / 2);
    const yScaleFn = (v: number) =>
      MARGIN.top + plotH - (v / maxVal) * plotH;

    // Generate ~5 horizontal grid lines
    const step = maxVal / 5;
    const lines: number[] = [];
    for (let v = 0; v <= maxVal; v += step) {
      lines.push(v);
    }

    return {
      yMax: maxVal,
      numSegments: maxLen,
      xScale: xScaleFn,
      yScale: yScaleFn,
      gridLines: lines,
    };
  }, [series, width, height]);

  const plotBottom = height - MARGIN.bottom;

  return (
    <svg
      width={width}
      height={height}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Grid lines */}
      {gridLines.map((v, i) => (
        <g key={i}>
          <line
            x1={MARGIN.left}
            y1={yScale(v)}
            x2={width - MARGIN.right}
            y2={yScale(v)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <text
            x={MARGIN.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="central"
            style={{ fontSize: 10, fill: '#94a3b8' }}
          >
            {Number.isInteger(v) ? v : v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* X axis line */}
      <line
        x1={MARGIN.left}
        y1={plotBottom}
        x2={width - MARGIN.right}
        y2={plotBottom}
        stroke="#cbd5e1"
        strokeWidth={1}
      />

      {/* X axis labels */}
      {Array.from({ length: numSegments }).map((_, i) => {
        const label = segmentLabels?.[i] ?? String(i);
        return (
          <text
            key={i}
            x={xScale(i)}
            y={plotBottom + 16}
            textAnchor="middle"
            style={{ fontSize: 10, fill: '#64748b' }}
          >
            {label}
          </text>
        );
      })}

      {/* Y axis line */}
      <line
        x1={MARGIN.left}
        y1={MARGIN.top}
        x2={MARGIN.left}
        y2={plotBottom}
        stroke="#cbd5e1"
        strokeWidth={1}
      />

      {/* Series lines and dots */}
      {series.map((s) => {
        if (s.values.length === 0) return null;

        const points = s.values.map((v, i) => ({
          x: xScale(i),
          y: yScale(v),
          value: v,
          index: i,
        }));

        const polylinePoints = points
          .map((p) => `${p.x},${p.y}`)
          .join(' ');

        return (
          <g key={s.label}>
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((p) => {
              const isHovered =
                hoveredPoint?.series === s.label &&
                hoveredPoint?.index === p.index;
              return (
                <circle
                  key={p.index}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  style={{
                    cursor: onPointClick ? 'pointer' : 'default',
                    transition: 'r 0.1s',
                  }}
                  onClick={() => onPointClick?.(s.label, p.index)}
                  onMouseEnter={() =>
                    setHoveredPoint({ series: s.label, index: p.index })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <title>
                    {s.label} [{segmentLabels?.[p.index] ?? p.index}]:{' '}
                    {p.value}
                  </title>
                </circle>
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      {series.map((s, i) => {
        const legendX = MARGIN.left + i * 120;
        return (
          <g key={s.label}>
            <rect
              x={legendX}
              y={8}
              width={12}
              height={12}
              rx={2}
              fill={s.color}
            />
            <text
              x={legendX + 16}
              y={14}
              dominantBaseline="central"
              style={{ fontSize: 11, fill: '#334155' }}
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default FrequencyTrends;
