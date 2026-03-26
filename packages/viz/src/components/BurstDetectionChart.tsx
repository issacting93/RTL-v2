import React, { useState, useMemo } from 'react';

interface BurstItem {
  label: string;
  bursts: Array<{ start: number; end: number; level: number }>;
}

interface BurstDetectionChartProps {
  items: BurstItem[];
  timeRange: [number, number];
  width?: number;
  rowHeight?: number;
  timeLabels?: Record<number, string>;
  onBurstClick?: (label: string, start: number, end: number) => void;
}

const BurstDetectionChart: React.FC<BurstDetectionChartProps> = ({
  items,
  timeRange,
  width = 700,
  rowHeight = 28,
  timeLabels,
  onBurstClick,
}) => {
  const [hovered, setHovered] = useState<{ label: string; start: number; end: number; level: number; x: number; y: number } | null>(null);

  const margin = { top: 20, right: 20, bottom: 40, left: 140 };
  const innerWidth = width - margin.left - margin.right;
  const totalHeight = margin.top + margin.bottom + items.length * rowHeight;
  const [tMin, tMax] = timeRange;
  const tSpan = tMax - tMin || 1;

  const scaleX = (t: number) => ((t - tMin) / tSpan) * innerWidth;

  const maxLevel = useMemo(() => {
    let max = 1;
    for (const item of items) {
      for (const b of item.bursts) {
        if (b.level > max) max = b.level;
      }
    }
    return max;
  }, [items]);

  // Generate time axis ticks
  const ticks = useMemo(() => {
    const count = Math.min(10, Math.floor(innerWidth / 60));
    const step = tSpan / count;
    const result: number[] = [];
    for (let i = 0; i <= count; i++) {
      result.push(tMin + i * step);
    }
    return result;
  }, [tMin, tSpan, innerWidth]);

  return (
    <svg width={width} height={totalHeight} style={{ background: '#fafafa' }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Rows */}
        {items.map((item, i) => {
          const y = i * rowHeight;
          return (
            <g key={item.label}>
              {/* Label */}
              <text
                x={-10}
                y={y + rowHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fontSize={11}
                fill="#333"
              >
                {item.label}
              </text>

              {/* Background bar */}
              <rect
                x={0}
                y={y + 3}
                width={innerWidth}
                height={rowHeight - 6}
                fill="#eee"
                rx={3}
              />

              {/* Burst segments */}
              {item.bursts.map((burst, bi) => {
                const bx = scaleX(burst.start);
                const bw = Math.max(2, scaleX(burst.end) - bx);
                const intensity = maxLevel > 0 ? burst.level / maxLevel : 1;
                const saturation = 40 + intensity * 60;
                const lightness = 60 - intensity * 25;
                const color = `hsl(10, ${saturation}%, ${lightness}%)`;

                return (
                  <rect
                    key={bi}
                    x={bx}
                    y={y + 3}
                    width={bw}
                    height={rowHeight - 6}
                    fill={color}
                    rx={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onBurstClick?.(item.label, burst.start, burst.end)}
                    onMouseEnter={(e) => {
                      const svg = e.currentTarget.ownerSVGElement;
                      if (!svg) return;
                      const rect = svg.getBoundingClientRect();
                      setHovered({
                        label: item.label,
                        start: burst.start,
                        end: burst.end,
                        level: burst.level,
                        x: bx + bw / 2,
                        y: y,
                      });
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Time axis */}
        <line
          x1={0}
          y1={items.length * rowHeight + 4}
          x2={innerWidth}
          y2={items.length * rowHeight + 4}
          stroke="#999"
          strokeWidth={1}
        />
        {ticks.map((t, i) => {
          const x = scaleX(t);
          const label = timeLabels?.[Math.round(t)] ?? String(Math.round(t));
          return (
            <g key={i}>
              <line
                x1={x}
                y1={items.length * rowHeight + 4}
                x2={x}
                y2={items.length * rowHeight + 10}
                stroke="#999"
              />
              <text
                x={x}
                y={items.length * rowHeight + 24}
                textAnchor="middle"
                fontSize={10}
                fill="#666"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hovered && (
          <g pointerEvents="none">
            <rect
              x={hovered.x - 70}
              y={hovered.y - 30}
              width={140}
              height={24}
              rx={4}
              fill="#333"
              fillOpacity={0.9}
            />
            <text
              x={hovered.x}
              y={hovered.y - 15}
              textAnchor="middle"
              fontSize={10}
              fill="#fff"
              dy="0.35em"
            >
              {`${hovered.start}–${hovered.end} (level ${hovered.level})`}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};

export default BurstDetectionChart;
