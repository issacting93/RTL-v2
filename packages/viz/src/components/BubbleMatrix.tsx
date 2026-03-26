import React, { useMemo, useState } from 'react';

interface BubbleMatrixProps {
  rows: string[];
  cols: string[];
  values: number[][];
  width?: number;
  colorScale?: (value: number) => string;
  onCellClick?: (row: string, col: string, value: number) => void;
}

function defaultColorScale(value: number, maxVal: number): string {
  if (maxVal === 0) return '#dbeafe';
  const t = Math.min(1, value / maxVal);
  const r = Math.round(219 * (1 - t) + 37 * t);
  const g = Math.round(234 * (1 - t) + 99 * t);
  const b = Math.round(254 * (1 - t) + 235 * t);
  return `rgb(${r},${g},${b})`;
}

const BubbleMatrix: React.FC<BubbleMatrixProps> = ({
  rows,
  cols,
  values,
  width = 500,
  colorScale,
  onCellClick,
}) => {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  const layout = useMemo(() => {
    const rowLabelWidth = 120;
    const colLabelHeight = 80;
    const cellSize = Math.max(20, (width - rowLabelWidth) / cols.length);
    const maxVal = Math.max(...values.flat(), 0);
    const maxRadius = cellSize * 0.42;
    const totalHeight = colLabelHeight + rows.length * cellSize;

    return { rowLabelWidth, colLabelHeight, cellSize, maxVal, maxRadius, totalHeight };
  }, [rows, cols, values, width]);

  const { rowLabelWidth, colLabelHeight, cellSize, maxVal, maxRadius, totalHeight } = layout;

  return (
    <svg
      width={width}
      height={totalHeight}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Column labels (rotated 45 degrees) */}
      {cols.map((col, j) => (
        <text
          key={`col-${j}`}
          x={rowLabelWidth + j * cellSize + cellSize / 2}
          y={colLabelHeight - 6}
          textAnchor="start"
          dominantBaseline="central"
          transform={`rotate(-45, ${rowLabelWidth + j * cellSize + cellSize / 2}, ${colLabelHeight - 6})`}
          style={{
            fontSize: Math.min(11, cellSize * 0.35),
            fill: hovered?.col === j ? '#111827' : '#4b5563',
            fontWeight: hovered?.col === j ? 600 : 400,
          }}
        >
          {col}
        </text>
      ))}

      {/* Row labels */}
      {rows.map((row, i) => (
        <text
          key={`row-${i}`}
          x={rowLabelWidth - 8}
          y={colLabelHeight + i * cellSize + cellSize / 2}
          textAnchor="end"
          dominantBaseline="central"
          style={{
            fontSize: Math.min(11, cellSize * 0.35),
            fill: hovered?.row === i ? '#111827' : '#4b5563',
            fontWeight: hovered?.row === i ? 600 : 400,
          }}
        >
          {row.length > 18 ? row.slice(0, 16) + '...' : row}
        </text>
      ))}

      {/* Grid background */}
      {rows.map((_, i) =>
        cols.map((_, j) => (
          <rect
            key={`bg-${i}-${j}`}
            x={rowLabelWidth + j * cellSize}
            y={colLabelHeight + i * cellSize}
            width={cellSize}
            height={cellSize}
            fill={
              hovered && (hovered.row === i || hovered.col === j)
                ? '#f3f4f6'
                : '#fafafa'
            }
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))
      )}

      {/* Bubbles */}
      {values.map((row, i) =>
        row.map((value, j) => {
          if (value <= 0) return null;
          const cx = rowLabelWidth + j * cellSize + cellSize / 2;
          const cy = colLabelHeight + i * cellSize + cellSize / 2;
          const radius = Math.sqrt(value / maxVal) * maxRadius;
          const isHoveredCell =
            hovered !== null && hovered.row === i && hovered.col === j;

          const fill = colorScale
            ? colorScale(value)
            : defaultColorScale(value, maxVal);

          return (
            <g
              key={`bubble-${i}-${j}`}
              onMouseEnter={() => setHovered({ row: i, col: j })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onCellClick?.(rows[i], cols[j], value)}
              style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={fill}
                stroke={isHoveredCell ? '#1d4ed8' : 'none'}
                strokeWidth={isHoveredCell ? 2 : 0}
                opacity={0.85}
              />
              {/* Tooltip on hover */}
              {isHoveredCell && (
                <g>
                  <rect
                    x={cx + radius + 4}
                    y={cy - 12}
                    width={50}
                    height={20}
                    fill="#111827"
                    rx={4}
                    opacity={0.9}
                  />
                  <text
                    x={cx + radius + 29}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 10, fill: '#ffffff', fontWeight: 500 }}
                  >
                    {typeof value === 'number' && value % 1 !== 0
                      ? value.toFixed(2)
                      : value}
                  </text>
                </g>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
};

export default BubbleMatrix;
