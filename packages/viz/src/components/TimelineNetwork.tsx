import React, { useMemo } from 'react';

interface TimeNode {
  id: string;
  label?: string;
  time: number;
  cluster?: string;
  color?: string;
  size?: number;
}

interface TimeEdge {
  source: string;
  target: string;
}

interface TimelineNetworkProps {
  nodes: TimeNode[];
  edges: TimeEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (id: string) => void;
  timeLabels?: Record<number, string>;
}

const TimelineNetwork: React.FC<TimelineNetworkProps> = ({
  nodes,
  edges,
  width = 800,
  height = 400,
  onNodeClick,
  timeLabels,
}) => {
  const margin = { top: 30, right: 40, bottom: 50, left: 120 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const layout = useMemo(() => {
    if (nodes.length === 0) return { positioned: [], clusterList: [], timeValues: [], nodeMap: new Map() };

    // Unique clusters
    const clusterSet = new Set<string>();
    for (const n of nodes) {
      clusterSet.add(n.cluster || 'default');
    }
    const clusterList = Array.from(clusterSet);

    // Time range
    const times = nodes.map((n) => n.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeSpan = maxTime - minTime || 1;

    // Unique time values for axis ticks
    const timeValues = Array.from(new Set(times)).sort((a, b) => a - b);

    // Cluster band height
    const bandHeight = innerHeight / clusterList.length;

    // Within each cluster+time, spread nodes vertically
    const groups = new Map<string, TimeNode[]>();
    for (const n of nodes) {
      const key = `${n.cluster || 'default'}__${n.time}`;
      const arr = groups.get(key) || [];
      arr.push(n);
      groups.set(key, arr);
    }

    const nodeMap = new Map<string, { x: number; y: number; node: TimeNode }>();
    const positioned = nodes.map((n) => {
      const cx = ((n.time - minTime) / timeSpan) * innerWidth;
      const ci = clusterList.indexOf(n.cluster || 'default');
      const bandTop = ci * bandHeight;
      const key = `${n.cluster || 'default'}__${n.time}`;
      const group = groups.get(key)!;
      const idx = group.indexOf(n);
      const spacing = Math.min(20, bandHeight / (group.length + 1));
      const cy = bandTop + bandHeight / 2 + (idx - (group.length - 1) / 2) * spacing;

      const entry = {
        x: cx,
        y: cy,
        node: n,
      };
      nodeMap.set(n.id, entry);
      return entry;
    });

    return { positioned, clusterList, timeValues, nodeMap };
  }, [nodes, innerWidth, innerHeight]);

  return (
    <svg width={width} height={height} style={{ background: '#fafafa' }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Cluster band separators and labels */}
        {layout.clusterList.map((cluster, ci) => {
          const bandHeight = innerHeight / layout.clusterList.length;
          const y = ci * bandHeight;
          return (
            <g key={cluster}>
              {ci > 0 && (
                <line
                  x1={0}
                  y1={y}
                  x2={innerWidth}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth={1}
                />
              )}
              <text
                x={-10}
                y={y + bandHeight / 2}
                dy="0.35em"
                textAnchor="end"
                fontSize={11}
                fill="#666"
              >
                {cluster}
              </text>
            </g>
          );
        })}

        {/* Time axis */}
        <line
          x1={0}
          y1={innerHeight}
          x2={innerWidth}
          y2={innerHeight}
          stroke="#999"
          strokeWidth={1}
        />
        {layout.timeValues.map((t) => {
          const times = nodes.map((n) => n.time);
          const minTime = Math.min(...times);
          const maxTime = Math.max(...times);
          const timeSpan = maxTime - minTime || 1;
          const x = ((t - minTime) / timeSpan) * innerWidth;
          const label = timeLabels?.[t] ?? String(t);
          return (
            <g key={t}>
              <line x1={x} y1={innerHeight} x2={x} y2={innerHeight + 6} stroke="#999" />
              <text
                x={x}
                y={innerHeight + 20}
                textAnchor="middle"
                fontSize={10}
                fill="#666"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Edges */}
        {edges.map((edge) => {
          const s = layout.nodeMap.get(edge.source);
          const t = layout.nodeMap.get(edge.target);
          if (!s || !t) return null;
          const dx = t.x - s.x;
          const ctrlOffset = Math.abs(dx) * 0.3;
          const path = `M${s.x},${s.y} C${s.x + ctrlOffset},${s.y} ${t.x - ctrlOffset},${t.y} ${t.x},${t.y}`;
          return (
            <path
              key={`${edge.source}-${edge.target}`}
              d={path}
              fill="none"
              stroke="#bbb"
              strokeWidth={1}
              strokeOpacity={0.6}
            />
          );
        })}

        {/* Nodes */}
        {layout.positioned.map(({ x, y, node }) => {
          const r = node.size || 6;
          const color = node.color || '#4a90d9';
          return (
            <g key={node.id}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={color}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => onNodeClick?.(node.id)}
              />
              {node.label && (
                <text
                  x={x}
                  y={y - r - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#444"
                  pointerEvents="none"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default TimelineNetwork;
