import React, { useMemo } from 'react';
import { Message } from '@research-tools/core';

interface RadialLayoutProps {
  messages: Message[];
  width?: number;
  height?: number;
  baseRadius?: number;
  maxRadius?: number;
  onNodeClick?: (id: string) => void;
  getNodeDistance?: (msg: Message) => number;
  getNodeColor?: (msg: Message) => string;
}

/**
 * A D3-powered radial visualization for conversation dynamics.
 * Maps messages to angular positions based on sequence and radial distances based on specified metrics.
 * 
 * @param messages - Array of conversation messages to visualize.
 * @param width - The width of the SVG container.
 * @param height - The height of the SVG container.
 * @param baseRadius - The radius of the inner central area.
 * @param maxRadius - The maximum radial distance for nodes.
 * @param onNodeClick - Callback triggered when a node is clicked.
 * @param getNodeDistance - Custom function to determine radial distance per message.
 * @param getNodeColor - Custom function to determine node color per message.
 */
export const RadialLayout: React.FC<RadialLayoutProps> = ({
  messages,
  width = 800,
  height = 800,
  baseRadius = 100,
  maxRadius = 250,
  onNodeClick,
  getNodeDistance = (m) => (m.metadata?.tension || 0.5) * maxRadius,
  getNodeColor = (m) => m.speaker === 'user' ? '#6366f1' : '#ec4899',
}) => {
  const centerX = width / 2;
  const centerY = height / 2;

  const positions = useMemo(() => {
    return messages.map((m, i) => {
      const angle = (i / messages.length) * 2 * Math.PI - Math.PI / 2;
      const distance = baseRadius + getNodeDistance(m);
      return {
        x: centerX + distance * Math.cos(angle),
        y: centerY + distance * Math.sin(angle),
        angle
      };
    });
  }, [messages, baseRadius, centerX, centerY, getNodeDistance]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <g>
        {/* Background rings */}
        {[0.25, 0.5, 0.75, 1].map(r => (
          <circle
            key={r}
            cx={centerX}
            cy={centerY}
            r={baseRadius + r * maxRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Connection lines */}
        {positions.map((pos, i) => {
          if (i === 0) return null;
          const prevPos = positions[i - 1];
          return (
            <line
              key={`line-${i}`}
              x1={prevPos.x}
              y1={prevPos.y}
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Nodes */}
        {messages.map((m, i) => {
          const pos = positions[i];
          const color = getNodeColor(m);
          return (
            <circle
              key={m.id || i}
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill={color}
              style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
              onClick={() => onNodeClick?.(m.id)}
            >
              <title>{m.content}</title>
            </circle>
          );
        })}
      </g>
    </svg>
  );
};
