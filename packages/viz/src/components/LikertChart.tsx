import React, { useMemo } from 'react';

interface LikertRow {
  question: string;
  negative: number;
  neutral: number;
  positive: number;
}

interface LikertChartProps {
  data: LikertRow[];
  width?: number;
  height?: number;
  negativeColor?: string;
  neutralColor?: string;
  positiveColor?: string;
  showValues?: boolean;
}

const LikertChart: React.FC<LikertChartProps> = ({
  data,
  width = 600,
  height,
  negativeColor = '#ef4444',
  neutralColor = '#d1d5db',
  positiveColor = '#22c55e',
  showValues = true,
}) => {
  const layout = useMemo(() => {
    const rowHeight = 36;
    const rowGap = 6;
    const labelWidth = 180;
    const marginTop = 30;
    const marginBottom = 10;
    const computedHeight =
      height ?? marginTop + data.length * (rowHeight + rowGap) + marginBottom;
    const barAreaWidth = width - labelWidth - 40;
    const centerX = labelWidth + 20 + barAreaWidth / 2;

    const rows = data.map((row, i) => {
      const total = row.negative + row.neutral + row.positive;
      if (total === 0) {
        return { y: marginTop + i * (rowHeight + rowGap), negW: 0, neutW: 0, posW: 0, negPct: 0, neutPct: 0, posPct: 0 };
      }
      const negPct = (row.negative / total) * 100;
      const neutPct = (row.neutral / total) * 100;
      const posPct = (row.positive / total) * 100;

      const scale = barAreaWidth / total;
      const negW = row.negative * scale;
      const neutW = row.neutral * scale;
      const posW = row.positive * scale;

      return {
        y: marginTop + i * (rowHeight + rowGap),
        negW,
        neutW,
        posW,
        negPct,
        neutPct,
        posPct,
      };
    });

    return { rowHeight, labelWidth, computedHeight, centerX, barAreaWidth, rows, marginTop };
  }, [data, width, height]);

  const { rowHeight, labelWidth, computedHeight, centerX, rows } = layout;

  return (
    <svg
      width={width}
      height={computedHeight}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Center line */}
      <line
        x1={centerX}
        y1={layout.marginTop - 10}
        x2={centerX}
        y2={computedHeight - 5}
        stroke="#9ca3af"
        strokeWidth={1}
        strokeDasharray="3,3"
      />

      {data.map((row, i) => {
        const r = rows[i];
        const halfNeut = r.neutW / 2;

        // Negative bar extends left from center
        const negX = centerX - halfNeut - r.negW;
        // Neutral bar straddles center
        const neutX = centerX - halfNeut;
        // Positive bar extends right from center
        const posX = centerX + halfNeut;

        return (
          <g key={i}>
            {/* Question label */}
            <text
              x={labelWidth - 8}
              y={r.y + rowHeight / 2}
              textAnchor="end"
              dominantBaseline="central"
              style={{ fontSize: 12, fill: '#374151' }}
            >
              {row.question.length > 28
                ? row.question.slice(0, 26) + '...'
                : row.question}
            </text>

            {/* Negative bar */}
            {r.negW > 0 && (
              <g>
                <rect
                  x={negX}
                  y={r.y}
                  width={r.negW}
                  height={rowHeight}
                  fill={negativeColor}
                  rx={3}
                />
                {showValues && r.negW > 30 && (
                  <text
                    x={negX + r.negW / 2}
                    y={r.y + rowHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 10, fill: '#fff', fontWeight: 600 }}
                  >
                    {r.negPct.toFixed(0)}%
                  </text>
                )}
              </g>
            )}

            {/* Neutral bar */}
            {r.neutW > 0 && (
              <g>
                <rect
                  x={neutX}
                  y={r.y}
                  width={r.neutW}
                  height={rowHeight}
                  fill={neutralColor}
                  rx={3}
                />
                {showValues && r.neutW > 30 && (
                  <text
                    x={neutX + r.neutW / 2}
                    y={r.y + rowHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }}
                  >
                    {r.neutPct.toFixed(0)}%
                  </text>
                )}
              </g>
            )}

            {/* Positive bar */}
            {r.posW > 0 && (
              <g>
                <rect
                  x={posX}
                  y={r.y}
                  width={r.posW}
                  height={rowHeight}
                  fill={positiveColor}
                  rx={3}
                />
                {showValues && r.posW > 30 && (
                  <text
                    x={posX + r.posW / 2}
                    y={r.y + rowHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 10, fill: '#fff', fontWeight: 600 }}
                  >
                    {r.posPct.toFixed(0)}%
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* Legend */}
      {[
        { color: negativeColor, label: 'Negative' },
        { color: neutralColor, label: 'Neutral' },
        { color: positiveColor, label: 'Positive' },
      ].map((item, i) => (
        <g key={item.label} transform={`translate(${centerX - 100 + i * 80}, 8)`}>
          <rect width={12} height={12} fill={item.color} rx={2} />
          <text x={16} y={10} style={{ fontSize: 10, fill: '#6b7280' }}>
            {item.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default LikertChart;
