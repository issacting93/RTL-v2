import React, { useMemo } from 'react';

interface DendrogramNode {
  id: string;
  label?: string;
  children?: DendrogramNode[];
  height: number;
}

interface ClusterDendrogramProps {
  root: DendrogramNode;
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  onLeafClick?: (id: string) => void;
  highlightIds?: string[];
}

interface LayoutNode {
  id: string;
  label?: string;
  height: number;
  x: number; // primary axis position (leaf spread direction)
  y: number; // height axis position (merge distance)
  children?: LayoutNode[];
  isLeaf: boolean;
}

function collectLeaves(node: DendrogramNode): DendrogramNode[] {
  if (!node.children || node.children.length === 0) return [node];
  return node.children.flatMap(collectLeaves);
}

function layoutTree(
  node: DendrogramNode,
  leafPositions: Map<string, number>,
  maxHeight: number,
  heightScale: (h: number) => number
): LayoutNode {
  const isLeaf = !node.children || node.children.length === 0;

  if (isLeaf) {
    const pos = leafPositions.get(node.id) ?? 0;
    return {
      id: node.id,
      label: node.label,
      height: node.height,
      x: pos,
      y: heightScale(node.height),
      isLeaf: true,
    };
  }

  const childLayouts = node.children!.map((c) =>
    layoutTree(c, leafPositions, maxHeight, heightScale)
  );
  const avgX =
    childLayouts.reduce((sum, c) => sum + c.x, 0) / childLayouts.length;

  return {
    id: node.id,
    label: node.label,
    height: node.height,
    x: avgX,
    y: heightScale(node.height),
    children: childLayouts,
    isLeaf: false,
  };
}

const ClusterDendrogram: React.FC<ClusterDendrogramProps> = ({
  root,
  width = 600,
  height = 400,
  orientation = 'horizontal',
  onLeafClick,
  highlightIds = [],
}) => {
  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);

  const { layoutRoot, links, leafNodes } = useMemo(() => {
    const leaves = collectLeaves(root);
    const leafCount = leaves.length;

    const labelMargin = orientation === 'horizontal' ? 120 : 80;
    const heightMargin = 30;

    const leafSpan =
      orientation === 'horizontal'
        ? height - 2 * heightMargin
        : width - 2 * heightMargin;

    const heightSpan =
      orientation === 'horizontal'
        ? width - labelMargin - heightMargin
        : height - labelMargin - heightMargin;

    // Assign leaf positions evenly
    const leafPositions = new Map<string, number>();
    leaves.forEach((leaf, i) => {
      leafPositions.set(
        leaf.id,
        heightMargin + (i / Math.max(1, leafCount - 1)) * leafSpan
      );
    });

    const maxHeight = root.height;
    const heightScale = (h: number) => {
      if (maxHeight === 0) return heightMargin;
      // Root at left/top, leaves at right/bottom
      if (orientation === 'horizontal') {
        return heightMargin + (1 - h / maxHeight) * heightSpan;
      } else {
        return heightMargin + (1 - h / maxHeight) * heightSpan;
      }
    };

    const lr = layoutTree(root, leafPositions, maxHeight, heightScale);

    // Collect links (U-shaped connectors)
    const allLinks: Array<{
      parentX: number;
      parentY: number;
      childX: number;
      childY: number;
    }> = [];

    function gatherLinks(node: LayoutNode) {
      if (node.children) {
        for (const child of node.children) {
          allLinks.push({
            parentX: node.x,
            parentY: node.y,
            childX: child.x,
            childY: child.y,
          });
          gatherLinks(child);
        }
      }
    }
    gatherLinks(lr);

    // Collect leaf nodes for labels
    const allLeaves: LayoutNode[] = [];
    function gatherLeaves(node: LayoutNode) {
      if (node.isLeaf) allLeaves.push(node);
      node.children?.forEach(gatherLeaves);
    }
    gatherLeaves(lr);

    return { layoutRoot: lr, links: allLinks, leafNodes: allLeaves };
  }, [root, width, height, orientation]);

  // Transform coordinates based on orientation
  // For horizontal: x maps to SVG-Y (vertical spread), y maps to SVG-X (height axis)
  // For vertical: x maps to SVG-X, y maps to SVG-Y
  const toSvg = (
    pos: { x: number; y: number }
  ): { sx: number; sy: number } => {
    if (orientation === 'horizontal') {
      return { sx: pos.y, sy: pos.x };
    }
    return { sx: pos.x, sy: pos.y };
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Links as U-shaped connectors */}
      {links.map((link, i) => {
        const parent = toSvg({ x: link.parentX, y: link.parentY });
        const child = toSvg({ x: link.childX, y: link.childY });

        let d: string;
        if (orientation === 'horizontal') {
          // U-shape: horizontal from parent, vertical to child's y, horizontal to child
          d = `M ${parent.sx} ${parent.sy} H ${parent.sx} V ${child.sy} H ${child.sx}`;
        } else {
          // U-shape: vertical from parent, horizontal to child's x, vertical to child
          d = `M ${parent.sx} ${parent.sy} V ${parent.sy} H ${child.sx} V ${child.sy}`;
        }

        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#6b7280"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Leaf labels and highlight markers */}
      {leafNodes.map((leaf) => {
        const pos = toSvg({ x: leaf.x, y: leaf.y });
        const isHighlighted = highlightSet.has(leaf.id);
        const labelText = leaf.label ?? leaf.id;

        return (
          <g
            key={leaf.id}
            onClick={() => onLeafClick?.(leaf.id)}
            style={{ cursor: onLeafClick ? 'pointer' : 'default' }}
          >
            {isHighlighted && (
              <circle
                cx={pos.sx}
                cy={pos.sy}
                r={5}
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth={1}
              />
            )}
            <text
              x={
                orientation === 'horizontal'
                  ? pos.sx + 8
                  : pos.sx
              }
              y={
                orientation === 'horizontal'
                  ? pos.sy
                  : pos.sy + 14
              }
              textAnchor={orientation === 'horizontal' ? 'start' : 'middle'}
              dominantBaseline={
                orientation === 'horizontal' ? 'central' : 'hanging'
              }
              style={{
                fontSize: 11,
                fill: isHighlighted ? '#b45309' : '#374151',
                fontWeight: isHighlighted ? 600 : 400,
              }}
            >
              {labelText}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default ClusterDendrogram;
