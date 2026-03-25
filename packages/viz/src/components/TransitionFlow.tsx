import React, { useMemo } from 'react';
import { TransitionMatrix } from '@research-tools/core';

interface TransitionFlowProps {
  matrix: TransitionMatrix;
  width?: number;
  height?: number;
  colorMap?: Record<string, string>;
}

export const TransitionFlow: React.FC<TransitionFlowProps> = ({
  matrix,
  width = 500,
  height = 400,
  colorMap = {},
}) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.3;
  const defaultColor = '#6366f1';

  const positions = useMemo(() => {
    return matrix.labels.map((label, i) => {
      const angle = (i / matrix.labels.length) * Math.PI * 2 - Math.PI / 2;
      return {
        label,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        angle,
      };
    });
  }, [matrix.labels, cx, cy, radius]);

  const maxVal = useMemo(() => {
    let max = 1;
    for (let i = 0; i < matrix.matrix.length; i++) {
      for (let j = 0; j < matrix.matrix[i].length; j++) {
        if (i !== j && matrix.matrix[i][j] > max) max = matrix.matrix[i][j];
      }
    }
    return max;
  }, [matrix.matrix]);

  const arcs: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];

  // Draw arcs
  for (let from = 0; from < matrix.labels.length; from++) {
    for (let to = 0; to < matrix.labels.length; to++) {
      const count = matrix.matrix[from][to];
      if (!count || from === to) continue;

      const p1 = positions[from];
      const p2 = positions[to];
      const color = colorMap[p1.label] || defaultColor;
      const strokeWidth = 1.5 + (count / maxVal) * 5;
      const opacity = 0.2 + (count / maxVal) * 0.5;

      const midX = (p1.x + p2.x) / 2 + (cy - (p1.y + p2.y) / 2) * 0.3;
      const midY = (p1.y + p2.y) / 2 - (cx - (p1.x + p2.x) / 2) * 0.3;

      arcs.push(
        <g key={`arc-${from}-${to}`}>
          <path
            d={`M${p1.x},${p1.y} Q${midX},${midY} ${p2.x},${p2.y}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
          <text
            x={(p1.x + 2 * midX + p2.x) / 4}
            y={(p1.y + 2 * midY + p2.y) / 4}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
            fontWeight="600"
          >
            {count}
          </text>
        </g>
      );
    }
  }

  // Draw nodes
  for (const pos of positions) {
    const color = colorMap[pos.label] || defaultColor;
    labels.push(
      <g key={`node-${pos.label}`}>
        <circle cx={pos.x} cy={pos.y} r={22} fill="rgba(15,23,42,0.8)" stroke={color} strokeWidth={2.5} />
        <text
          x={pos.x}
          y={pos.y - 30}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={color}
        >
          {pos.label}
        </text>
      </g>
    );
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {arcs}
      {labels}
    </svg>
  );
};
