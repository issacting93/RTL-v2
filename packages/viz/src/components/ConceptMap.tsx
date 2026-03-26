import React, { useState, useMemo, useCallback, useRef } from 'react';

interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  type?: string;
}

interface ConceptEdge {
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

interface ConceptMapProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  width?: number;
  height?: number;
  onNodeMove?: (id: string, x: number, y: number) => void;
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (source: string, target: string) => void;
  editable?: boolean;
}

const NODE_RX = 8;
const NODE_PADDING_X = 14;
const NODE_PADDING_Y = 8;
const FONT_SIZE = 12;
const ARROW_SIZE = 8;

const ConceptMap: React.FC<ConceptMapProps> = ({
  nodes,
  edges,
  width = 800,
  height = 500,
  onNodeMove,
  onNodeClick,
  onEdgeClick,
  editable = false,
}) => {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(
    () => new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }])),
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync positions when nodes prop changes
  useMemo(() => {
    setPositions((prev) => {
      const next = new Map(prev);
      for (const n of nodes) {
        if (!next.has(n.id)) {
          next.set(n.id, { x: n.x, y: n.y });
        }
      }
      return next;
    });
  }, [nodes]);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const getPos = useCallback(
    (id: string) => positions.get(id) || { x: 0, y: 0 },
    [positions],
  );

  const estimateTextWidth = (text: string) => text.length * FONT_SIZE * 0.6;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (!editable) return;
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const pos = getPos(id);
      dragOffset.current = {
        x: e.clientX - rect.left - pos.x,
        y: e.clientY - rect.top - pos.y,
      };
      setDragId(id);
    },
    [editable, getPos],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragId) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const nx = e.clientX - rect.left - dragOffset.current.x;
      const ny = e.clientY - rect.top - dragOffset.current.y;
      setPositions((prev) => {
        const next = new Map(prev);
        next.set(dragId, { x: nx, y: ny });
        return next;
      });
    },
    [dragId],
  );

  const handleMouseUp = useCallback(() => {
    if (dragId) {
      const pos = positions.get(dragId);
      if (pos) onNodeMove?.(dragId, pos.x, pos.y);
      setDragId(null);
    }
  }, [dragId, positions, onNodeMove]);

  const renderedEdges = useMemo(() => {
    return edges.map((edge) => {
      const sp = getPos(edge.source);
      const tp = getPos(edge.target);
      const dx = tp.x - sp.x;
      const dy = tp.y - sp.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      // Shorten line to not overlap node rects
      const sNode = nodeMap.get(edge.source);
      const tNode = nodeMap.get(edge.target);
      const sHalfW = sNode ? estimateTextWidth(sNode.label) / 2 + NODE_PADDING_X : 20;
      const tHalfW = tNode ? estimateTextWidth(tNode.label) / 2 + NODE_PADDING_X : 20;
      const sOffset = Math.min(sHalfW + 4, dist / 3);
      const tOffset = Math.min(tHalfW + 4 + ARROW_SIZE, dist / 3);

      const x1 = sp.x + ux * sOffset;
      const y1 = sp.y + uy * sOffset;
      const x2 = tp.x - ux * tOffset;
      const y2 = tp.y - uy * tOffset;

      const mx = (sp.x + tp.x) / 2;
      const my = (sp.y + tp.y) / 2 - 10;

      const arrowX = tp.x - ux * (tOffset - ARROW_SIZE);
      const arrowY = tp.y - uy * (tOffset - ARROW_SIZE);
      const perpX = -uy;
      const perpY = ux;
      const arrowPath = `M${x2},${y2} L${arrowX + perpX * ARROW_SIZE * 0.4},${arrowY + perpY * ARROW_SIZE * 0.4} L${arrowX - perpX * ARROW_SIZE * 0.4},${arrowY - perpY * ARROW_SIZE * 0.4} Z`;

      const key = `${edge.source}-${edge.target}`;
      const isDashed = edge.style === 'dashed';

      return (
        <g key={key}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#666"
            strokeWidth={1.5}
            strokeDasharray={isDashed ? '6,4' : undefined}
            style={{ cursor: 'pointer' }}
            onClick={() => onEdgeClick?.(edge.source, edge.target)}
          />
          <path d={arrowPath} fill="#666" />
          {edge.label && (
            <>
              <rect
                x={mx - edge.label.length * 3.2 - 3}
                y={my - 8}
                width={edge.label.length * 6.4 + 6}
                height={16}
                fill="#fff"
                rx={3}
              />
              <text
                x={mx}
                y={my}
                dy="0.35em"
                textAnchor="middle"
                fontSize={10}
                fill="#555"
                pointerEvents="none"
              >
                {edge.label}
              </text>
            </>
          )}
        </g>
      );
    });
  }, [edges, getPos, nodeMap, onEdgeClick]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ background: '#fafafa', userSelect: 'none' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {renderedEdges}

      {nodes.map((node) => {
        const pos = getPos(node.id);
        const textW = estimateTextWidth(node.label);
        const rectW = textW + NODE_PADDING_X * 2;
        const rectH = FONT_SIZE + NODE_PADDING_Y * 2;
        const color = node.color || '#4a90d9';

        return (
          <g
            key={node.id}
            style={{ cursor: editable ? 'grab' : 'pointer' }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => onNodeClick?.(node.id)}
          >
            <rect
              x={pos.x - rectW / 2}
              y={pos.y - rectH / 2}
              width={rectW}
              height={rectH}
              rx={NODE_RX}
              fill={color}
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={pos.x}
              y={pos.y}
              dy="0.35em"
              textAnchor="middle"
              fontSize={FONT_SIZE}
              fill="#fff"
              fontWeight={500}
              pointerEvents="none"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default ConceptMap;
