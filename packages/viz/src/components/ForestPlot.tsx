import React, { useMemo, useState } from 'react';

interface ForestEntry {
  label: string;
  estimate: number;
  lower: number;
  upper: number;
  weight?: number;
}

interface ForestPlotProps {
  entries: ForestEntry[];
  overall?: ForestEntry;
  width?: number;
  nullValue?: number;
  onEntryClick?: (label: string) => void;
}

const ForestPlot: React.FC<ForestPlotProps> = ({
  entries,
  overall,
  width = 500,
  nullValue = 0,
  onEntryClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const layout = useMemo(() => {
    const labelWidth = 140;
    const marginRight = 20;
    const marginTop = 30;
    const rowHeight = 28;
    const overallGap = 16;
    const axisHeight = 30;
    const plotWidth = width - labelWidth - marginRight;

    const allEntries = overall ? [...entries, overall] : entries;
    const minVal = Math.min(...allEntries.map((e) => e.lower), nullValue);
    const maxVal = Math.max(...allEntries.map((e) => e.upper), nullValue);
    const padding = (maxVal - minVal) * 0.1 || 1;
    const domainMin = minVal - padding;
    const domainMax = maxVal + padding;

    const scaleX = (v: number) =>
      labelWidth + ((v - domainMin) / (domainMax - domainMin)) * plotWidth;

    const totalRows = entries.length + (overall ? 1 : 0);
    const totalHeight =
      marginTop +
      entries.length * rowHeight +
      (overall ? overallGap + rowHeight : 0) +
      axisHeight;

    const maxWeight = Math.max(...entries.map((e) => e.weight ?? 1));

    return {
      labelWidth,
      marginTop,
      rowHeight,
      overallGap,
      plotWidth,
      scaleX,
      totalHeight,
      domainMin,
      domainMax,
      maxWeight,
      axisHeight,
    };
  }, [entries, overall, width, nullValue]);

  const {
    labelWidth,
    marginTop,
    rowHeight,
    overallGap,
    scaleX,
    totalHeight,
    domainMin,
    domainMax,
    maxWeight,
  } = layout;

  const nullX = scaleX(nullValue);

  // Generate nice axis ticks
  const ticks = useMemo(() => {
    const range = domainMax - domainMin;
    const rawStep = range / 6;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    const step =
      normalized <= 1.5
        ? magnitude
        : normalized <= 3
          ? 2 * magnitude
          : normalized <= 7
            ? 5 * magnitude
            : 10 * magnitude;

    const result: number[] = [];
    let tick = Math.ceil(domainMin / step) * step;
    while (tick <= domainMax) {
      result.push(tick);
      tick += step;
    }
    return result;
  }, [domainMin, domainMax]);

  const axisY = marginTop + entries.length * rowHeight + (overall ? overallGap + rowHeight : 0) + 10;

  return (
    <svg
      width={width}
      height={totalHeight}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Null reference line */}
      <line
        x1={nullX}
        y1={marginTop - 10}
        x2={nullX}
        y2={axisY}
        stroke="#9ca3af"
        strokeWidth={1}
        strokeDasharray="5,4"
      />

      {/* Entries */}
      {entries.map((entry, i) => {
        const y = marginTop + i * rowHeight + rowHeight / 2;
        const weight = entry.weight ?? 1;
        const sqSize = 4 + (weight / maxWeight) * 8;
        const isHovered = hoveredIndex === i;

        return (
          <g
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onEntryClick?.(entry.label)}
            style={{ cursor: onEntryClick ? 'pointer' : 'default' }}
          >
            {/* Label */}
            <text
              x={labelWidth - 10}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              style={{
                fontSize: 11,
                fill: isHovered ? '#111827' : '#374151',
                fontWeight: isHovered ? 600 : 400,
              }}
            >
              {entry.label}
            </text>

            {/* CI line */}
            <line
              x1={scaleX(entry.lower)}
              y1={y}
              x2={scaleX(entry.upper)}
              y2={y}
              stroke={isHovered ? '#111827' : '#374151'}
              strokeWidth={isHovered ? 2 : 1.5}
            />

            {/* CI caps */}
            {[entry.lower, entry.upper].map((val, ci) => (
              <line
                key={ci}
                x1={scaleX(val)}
                y1={y - 4}
                x2={scaleX(val)}
                y2={y + 4}
                stroke={isHovered ? '#111827' : '#374151'}
                strokeWidth={1.5}
              />
            ))}

            {/* Estimate square */}
            <rect
              x={scaleX(entry.estimate) - sqSize / 2}
              y={y - sqSize / 2}
              width={sqSize}
              height={sqSize}
              fill={isHovered ? '#1d4ed8' : '#2563eb'}
            />
          </g>
        );
      })}

      {/* Overall diamond */}
      {overall && (() => {
        const y =
          marginTop + entries.length * rowHeight + overallGap + rowHeight / 2;
        const cx = scaleX(overall.estimate);
        const lx = scaleX(overall.lower);
        const rx = scaleX(overall.upper);
        const dy = 8;

        return (
          <g>
            {/* Separator line */}
            <line
              x1={labelWidth}
              y1={marginTop + entries.length * rowHeight + overallGap / 2}
              x2={width - 20}
              y2={marginTop + entries.length * rowHeight + overallGap / 2}
              stroke="#d1d5db"
              strokeWidth={1}
            />

            {/* Label */}
            <text
              x={labelWidth - 10}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              style={{ fontSize: 11, fill: '#111827', fontWeight: 700 }}
            >
              {overall.label}
            </text>

            {/* Diamond */}
            <polygon
              points={`${lx},${y} ${cx},${y - dy} ${rx},${y} ${cx},${y + dy}`}
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth={1}
            />
          </g>
        );
      })()}

      {/* X-axis */}
      <line
        x1={scaleX(domainMin)}
        y1={axisY}
        x2={scaleX(domainMax)}
        y2={axisY}
        stroke="#6b7280"
        strokeWidth={1}
      />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={scaleX(tick)}
            y1={axisY}
            x2={scaleX(tick)}
            y2={axisY + 5}
            stroke="#6b7280"
            strokeWidth={1}
          />
          <text
            x={scaleX(tick)}
            y={axisY + 16}
            textAnchor="middle"
            style={{ fontSize: 10, fill: '#6b7280' }}
          >
            {Number.isInteger(tick) ? tick : tick.toFixed(2)}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default ForestPlot;
