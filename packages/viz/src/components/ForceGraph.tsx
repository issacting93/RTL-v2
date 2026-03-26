import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';

interface ForceNode {
  id: string;
  label?: string;
  color?: string;
  size?: number;
  group?: string;
  x?: number;
  y?: number;
}

interface ForceLink {
  source: string;
  target: string;
  weight?: number;
  color?: string;
}

interface ForceGraphProps {
  nodes: ForceNode[];
  links: ForceLink[];
  width?: number;
  height?: number;
  onNodeClick?: (id: string) => void;
  highlightIds?: string[];
  showLabels?: boolean;
  chargeStrength?: number;
}

interface SimNode {
  id: string;
  label?: string;
  color: string;
  size: number;
  group?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  links,
  width = 600,
  height = 500,
  onNodeClick,
  highlightIds = [],
  showLabels = true,
  chargeStrength = -100,
}) => {
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, number>();
    simNodes.forEach((n, i) => map.set(n.id, i));
    return map;
  }, [simNodes]);

  // Run force simulation on mount / when data changes
  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;

    const sNodes: SimNode[] = nodes.map((n, i) => ({
      id: n.id,
      label: n.label,
      color: n.color || '#4a90d9',
      size: n.size || 8,
      group: n.group,
      x: n.x ?? cx + (Math.random() - 0.5) * width * 0.6,
      y: n.y ?? cy + (Math.random() - 0.5) * height * 0.6,
      vx: 0,
      vy: 0,
    }));

    const idxMap = new Map<string, number>();
    sNodes.forEach((n, i) => idxMap.set(n.id, i));

    const linkIndices = links
      .map((l) => ({
        si: idxMap.get(l.source),
        ti: idxMap.get(l.target),
        weight: l.weight ?? 1,
      }))
      .filter((l) => l.si !== undefined && l.ti !== undefined) as Array<{
      si: number;
      ti: number;
      weight: number;
    }>;

    const springLength = 80;
    const springStrength = 0.005;
    const damping = 0.85;

    for (let iter = 0; iter < 100; iter++) {
      // Center force
      for (const node of sNodes) {
        node.vx += (cx - node.x) * 0.001;
        node.vy += (cy - node.y) * 0.001;
      }

      // Charge repulsion (all pairs)
      for (let i = 0; i < sNodes.length; i++) {
        for (let j = i + 1; j < sNodes.length; j++) {
          const dx = sNodes[j].x - sNodes[i].x;
          const dy = sNodes[j].y - sNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = chargeStrength / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          sNodes[i].vx -= fx;
          sNodes[i].vy -= fy;
          sNodes[j].vx += fx;
          sNodes[j].vy += fy;
        }
      }

      // Link spring force
      for (const link of linkIndices) {
        const a = sNodes[link.si];
        const b = sNodes[link.ti];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - springLength;
        const force = displacement * springStrength * link.weight;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // Collision detection
      for (let i = 0; i < sNodes.length; i++) {
        for (let j = i + 1; j < sNodes.length; j++) {
          const dx = sNodes[j].x - sNodes[i].x;
          const dy = sNodes[j].y - sNodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = sNodes[i].size + sNodes[j].size + 2;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const ox = (dx / dist) * overlap;
            const oy = (dy / dist) * overlap;
            sNodes[i].x -= ox;
            sNodes[i].y -= oy;
            sNodes[j].x += ox;
            sNodes[j].y += oy;
          }
        }
      }

      // Apply velocity with damping
      for (const node of sNodes) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      }
    }

    setSimNodes(sNodes);
  }, [nodes, links, width, height, chargeStrength]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.2, Math.min(5, z * (1 - e.deltaY * 0.001))));
  }, []);

  const handleBgMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as SVGElement).tagName === 'svg' || (e.target as SVGElement).tagName === 'rect') {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      }
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({
          x: panStart.current.panX + (e.clientX - panStart.current.x),
          y: panStart.current.panY + (e.clientY - panStart.current.y),
        });
        return;
      }
      if (dragId === null) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      setSimNodes((prev) =>
        prev.map((n) =>
          n.id === dragId ? { ...n, x: mx - dragOffset.current.x, y: my - dragOffset.current.y } : n,
        ),
      );
    },
    [dragId, isPanning, pan, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setDragId(null);
    setIsPanning(false);
  }, []);

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      const node = simNodes.find((n) => n.id === id);
      if (node) {
        dragOffset.current = { x: mx - node.x, y: my - node.y };
      }
      setDragId(id);
    },
    [simNodes, pan, zoom],
  );

  const renderedLinks = useMemo(
    () =>
      links
        .map((link) => {
          const si = nodeMap.get(link.source);
          const ti = nodeMap.get(link.target);
          if (si === undefined || ti === undefined) return null;
          const s = simNodes[si];
          const t = simNodes[ti];
          return (
            <line
              key={`${link.source}-${link.target}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={link.color || '#999'}
              strokeWidth={Math.max(1, (link.weight || 1) * 1.5)}
              strokeOpacity={0.6}
            />
          );
        })
        .filter(Boolean),
    [links, simNodes, nodeMap],
  );

  const showNodeLabels = showLabels && (zoom > 0.6 || simNodes.length < 50);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ background: '#fafafa', cursor: isPanning ? 'grabbing' : 'grab', userSelect: 'none' }}
      onWheel={handleWheel}
      onMouseDown={handleBgMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <rect width={width} height={height} fill="transparent" />
      <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
        {renderedLinks}
        {simNodes.map((node) => {
          const isHighlighted = highlightSet.has(node.id);
          return (
            <g key={node.id}>
              {isHighlighted && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size + 6}
                  fill="none"
                  stroke="#f5a623"
                  strokeWidth={3}
                  strokeOpacity={0.7}
                  style={{ filter: 'url(#glow)' }}
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={() => onNodeClick?.(node.id)}
              />
              {showNodeLabels && node.label && (
                <text
                  x={node.x + node.size + 4}
                  y={node.y + 4}
                  fontSize={11}
                  fill="#333"
                  pointerEvents="none"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export default ForceGraph;
