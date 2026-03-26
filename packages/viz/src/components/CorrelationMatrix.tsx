import React, { useMemo, useState } from 'react';

interface CorrelationMatrixProps {
  labels: string[];
  matrix: number[][];
  width?: number;
  onCellClick?: (row: string, col: string, value: number) => void;
}

function correlationColor(value: number): string {
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped < 0) {
    const t = -clamped;
    const r = Math.round(255 * (1 - t) + 59 * t);
    const g = Math.round(255 * (1 - t) + 130 * t);
    const b = Math.round(255 * (1 - t) + 246 * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = clamped;
    const r = Math.round(255 * (1 - t) + 239 * t);
    const g = Math.round(255 * (1 - t) + 68 * t);
    const b = Math.round(255 * (1 - t) + 68 * t);
    return `rgb(${r},${g},${b})`;
  }
}

function significanceStars(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.9) return '***';
  if (abs >= 0.7) return '**';
  if (abs >= 0.5) return '*';
  return '';
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  labels,
  matrix,
  width = 500,
  onCellClick,
}) => {
  const n = labels.length;
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  const layout = useMemo(() => {
    const labelMargin = 100;
    const cellSize = (width - labelMargin) / n;
    return { labelMargin, cellSize };
  }, [width, n]);

  const { labelMargin, cellSize } = layout;
  const totalHeight = labelMargin + n * cellSize;

  return (
    <svg
      width={width}
      height={totalHeight}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Diagonal labels */}
      {labels.map((label, i) => (
        <text
          key={`diag-${i}`}
          x={labelMargin + i * cellSize + cellSize / 2}
          y={labelMargin + i * cellSize + cellSize / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontSize: Math.min(cellSize * 0.28, 12),
            fontWeight: 600,
            fill: '#1f2937',
          }}
        >
          {label}
        </text>
      ))}

      {/* Lower triangle cells */}
      {matrix.map((row, i) =>
        row.map((value, j) => {
          if (i <= j) return null;
          const x = labelMargin + j * cellSize;
          const y = labelMargin + i * cellSize;
          const isHighlighted =
            hovered !== null && (hovered.row === i || hovered.col === j);
          const isHoveredCell =
            hovered !== null && hovered.row === i && hovered.col === j;

          return (
            <g
              key={`cell-${i}-${j}`}
              onMouseEnter={() => setHovered({ row: i, col: j })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onCellClick?.(labels[i], labels[j], value)}
              style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            >
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={correlationColor(value)}
                stroke={isHoveredCell ? '#111827' : isHighlighted ? '#6b7280' : '#e5e7eb'}
                strokeWidth={isHoveredCell ? 2 : 1}
              />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 - 2}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: Math.min(cellSize * 0.25, 11),
                  fill: Math.abs(value) > 0.6 ? '#ffffff' : '#1f2937',
                  fontWeight: 500,
                }}
              >
                {value.toFixed(2)}
              </text>
              {significanceStars(value) && (
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + Math.min(cellSize * 0.2, 10)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: Math.min(cellSize * 0.18, 8),
                    fill: Math.abs(value) > 0.6 ? '#fde68a' : '#92400e',
                  }}
                >
                  {significanceStars(value)}
                </text>
              )}
            </g>
          );
        })
      )}

      {/* Row labels (left side) */}
      {labels.map((label, i) => {
        if (i === 0) return null;
        return (
          <text
            key={`row-${i}`}
            x={labelMargin - 6}
            y={labelMargin + i * cellSize + cellSize / 2}
            textAnchor="end"
            dominantBaseline="central"
            style={{
              fontSize: Math.min(cellSize * 0.3, 12),
              fill: hovered?.row === i ? '#111827' : '#4b5563',
              fontWeight: hovered?.row === i ? 600 : 400,
            }}
          >
            {label}
          </text>
        );
      })}

      {/* Column labels (top) */}
      {labels.map((label, j) => {
        if (j >= n - 1) return null;
        return (
          <text
            key={`col-${j}`}
            x={labelMargin + j * cellSize + cellSize / 2}
            y={labelMargin - 6}
            textAnchor="start"
            dominantBaseline="central"
            transform={`rotate(-45, ${labelMargin + j * cellSize + cellSize / 2}, ${labelMargin - 6})`}
            style={{
              fontSize: Math.min(cellSize * 0.3, 12),
              fill: hovered?.col === j ? '#111827' : '#4b5563',
              fontWeight: hovered?.col === j ? 600 : 400,
            }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

export default CorrelationMatrix;
