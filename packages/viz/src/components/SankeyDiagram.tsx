import React, { useState, useMemo } from 'react';

interface SankeyNode {
  id: string;
  label: string;
  color?: string;
  column: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  onNodeClick?: (id: string) => void;
  onLinkHover?: (source: string, target: string) => void;
}

interface LayoutNode {
  id: string;
  label: string;
  color: string;
  column: number;
  x: number;
  y: number;
  height: number;
  totalFlow: number;
}

interface LayoutLink {
  source: string;
  target: string;
  value: number;
  sy: number;
  ty: number;
  thickness: number;
}

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  width = 700,
  height = 400,
  nodeWidth = 20,
  nodePadding = 10,
  onNodeClick,
  onLinkHover,
}) => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const layout = useMemo(() => {
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Group nodes by column
    const columns = new Map<number, SankeyNode[]>();
    for (const node of nodes) {
      const col = columns.get(node.column) || [];
      col.push(node);
      columns.set(node.column, col);
    }

    const colIndices = Array.from(columns.keys()).sort((a, b) => a - b);
    const numColumns = colIndices.length;

    // Compute total flow per node
    const flowIn = new Map<string, number>();
    const flowOut = new Map<string, number>();
    for (const link of links) {
      flowOut.set(link.source, (flowOut.get(link.source) || 0) + link.value);
      flowIn.set(link.target, (flowIn.get(link.target) || 0) + link.value);
    }

    const totalFlowMap = new Map<string, number>();
    for (const node of nodes) {
      totalFlowMap.set(node.id, Math.max(flowIn.get(node.id) || 0, flowOut.get(node.id) || 0));
    }

    // Layout nodes
    const layoutNodes: LayoutNode[] = [];
    const nodePositions = new Map<string, LayoutNode>();

    for (let ci = 0; ci < colIndices.length; ci++) {
      const colKey = colIndices[ci];
      const colNodes = columns.get(colKey)!;
      const x = numColumns > 1 ? margin.left + (ci / (numColumns - 1)) * innerWidth : margin.left + innerWidth / 2;

      const totalFlow = colNodes.reduce((sum, n) => sum + (totalFlowMap.get(n.id) || 1), 0);
      const totalPadding = (colNodes.length - 1) * nodePadding;
      const availableHeight = innerHeight - totalPadding;
      const scale = totalFlow > 0 ? availableHeight / totalFlow : 1;

      let currentY = margin.top;
      for (const node of colNodes) {
        const flow = totalFlowMap.get(node.id) || 1;
        const h = Math.max(4, flow * scale);
        const ln: LayoutNode = {
          id: node.id,
          label: node.label,
          color: node.color || '#4a90d9',
          column: node.column,
          x,
          y: currentY,
          height: h,
          totalFlow: flow,
        };
        layoutNodes.push(ln);
        nodePositions.set(node.id, ln);
        currentY += h + nodePadding;
      }
    }

    // Layout links with proper stacking
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();

    const layoutLinks: LayoutLink[] = [];
    for (const link of links) {
      const sn = nodePositions.get(link.source);
      const tn = nodePositions.get(link.target);
      if (!sn || !tn) continue;

      const sOff = sourceOffsets.get(link.source) || 0;
      const tOff = targetOffsets.get(link.target) || 0;
      const thickness = sn.totalFlow > 0 ? (link.value / sn.totalFlow) * sn.height : 4;

      layoutLinks.push({
        source: link.source,
        target: link.target,
        value: link.value,
        sy: sn.y + sOff + thickness / 2,
        ty: tn.y + tOff + thickness / 2,
        thickness,
      });

      sourceOffsets.set(link.source, sOff + thickness);
      targetOffsets.set(link.target, tOff + thickness);
    }

    return { layoutNodes, layoutLinks, nodePositions };
  }, [nodes, links, width, height, nodeWidth, nodePadding]);

  const makePath = (link: LayoutLink) => {
    const sn = layout.nodePositions.get(link.source)!;
    const tn = layout.nodePositions.get(link.target)!;
    const x0 = sn.x + nodeWidth;
    const x1 = tn.x;
    const midX = (x0 + x1) / 2;
    return `M${x0},${link.sy} C${midX},${link.sy} ${midX},${link.ty} ${x1},${link.ty}`;
  };

  return (
    <svg width={width} height={height} style={{ background: '#fafafa' }}>
      {/* Links */}
      {layout.layoutLinks.map((link) => {
        const key = `${link.source}-${link.target}`;
        const isHovered = hoveredLink === key;
        const isDimmed = hoveredLink !== null && !isHovered;
        return (
          <path
            key={key}
            d={makePath(link)}
            fill="none"
            stroke={isHovered ? '#f5a623' : '#aaa'}
            strokeWidth={link.thickness}
            strokeOpacity={isDimmed ? 0.15 : 0.4}
            style={{ cursor: 'pointer', transition: 'stroke-opacity 0.2s' }}
            onMouseEnter={() => {
              setHoveredLink(key);
              onLinkHover?.(link.source, link.target);
            }}
            onMouseLeave={() => setHoveredLink(null)}
          />
        );
      })}

      {/* Nodes */}
      {layout.layoutNodes.map((node) => {
        const isLeftColumn =
          node.column ===
          Math.min(...layout.layoutNodes.map((n) => n.column));
        return (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={node.height}
              fill={node.color}
              stroke="#fff"
              strokeWidth={1}
              style={{ cursor: 'pointer' }}
              onClick={() => onNodeClick?.(node.id)}
            />
            <text
              x={isLeftColumn ? node.x - 6 : node.x + nodeWidth + 6}
              y={node.y + node.height / 2}
              dy="0.35em"
              textAnchor={isLeftColumn ? 'end' : 'start'}
              fontSize={11}
              fill="#333"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default SankeyDiagram;
