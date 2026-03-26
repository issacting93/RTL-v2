import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { theme } from '@research-tools/ui';
import { GraphData, GraphNode, GraphLink } from '@research-tools/core';

interface TopologyNetworkProps {
  data: GraphData;
  activeTypes?: Set<string>;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  showLabels?: boolean;
}

const EDGE_COLORS: { [key: string]: string } = {
  'NEXT': '#64748b',
  'CONTAINS': '#60a5fa',
  'VIOLATES': '#f87171',
  'REPAIR': '#4ade80',
  'RATIFIES': '#c084fc',
  'TRIGGERS': '#fbbf24',
  'OPERATES_IN': '#94a3b8'
};

const NODE_COLORS: { [key: string]: string } = {
  'Conversation': '#1a1a1a',
  'Turn': '#f5c542',
  'Move': '#60a5fa',
  'Constraint': '#e85a3c',
  'ViolationEvent': '#f87171',
  'InteractionMode': '#94a3b8'
};

const NODE_RADII: { [key: string]: number } = {
  'Conversation': 14,
  'Turn': 10,
  'Move': 7,
  'Constraint': 7,
  'ViolationEvent': 8,
  'InteractionMode': 10
};

export const TopologyNetwork: React.FC<TopologyNetworkProps> = ({
  data,
  activeTypes = new Set(['Conversation', 'Turn', 'Move', 'Constraint', 'ViolationEvent']),
  width = 800,
  height = 800,
  onNodeClick,
  showLabels = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => container.attr('transform', event.transform));
    svg.call(zoom as any);

    // Markers
    const defs = svg.append('defs');
    Object.entries(EDGE_COLORS).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Filter data
    const filteredNodes = data.nodes.filter(n => activeTypes.has(n.node_type));
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = data.links.filter(l => 
      nodeIds.has(typeof l.source === 'string' ? l.source : l.source.id) && 
      nodeIds.has(typeof l.target === 'string' ? l.target : l.target.id)
    );

    // Simulation
    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).distance(50).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (NODE_RADII[(d as any).node_type] || 10) + 5));

    // Custom Radial Force logic
    const radialLayout = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const turns = filteredNodes.filter(n => n.node_type === 'Turn')
        .sort((a: any, b: any) => (a.turn_index || 0) - (b.turn_index || 0));
      
      const nTurns = turns.length;
      const baseR = 150;
      const ringStep = 80;
      
      // Map turns to rings
      let currentRing = 0;
      let lastModeId = null;
      
      // Simple mode detection if not provided
      turns.forEach((t: any, i) => {
        const angle = (i / nTurns) * 2 * Math.PI - Math.PI / 2;
        // In real app we check OPERATES_IN links
        t.fx = centerX + baseR * Math.cos(angle);
        t.fy = centerY + baseR * Math.sin(angle);
      });
    };

    radialLayout();

    // Render Links
    const link = container.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter().append('line')
      .attr('stroke', d => EDGE_COLORS[d.edge_type] || '#ccc')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3)
      .attr('marker-end', d => `url(#arrow-${d.edge_type})`);

    // Render Nodes
    const node = container.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle')
      .attr('r', d => NODE_RADII[d.node_type] || 10)
      .attr('fill', d => NODE_COLORS[d.node_type] || '#ccc')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick?.(d as GraphNode));

    if (showLabels) {
      node.append('text')
        .attr('dy', d => (NODE_RADII[d.node_type] || 10) + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', theme.colors.text.secondary)
        .style('font-size', '10px')
        .style('pointer-events', 'none')
        .text(d => (d as any).label || (d as any).id.split('_').pop());
    }

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${(d as any).x},${(d as any).y})`);
    });

  }, [data, activeTypes, width, height, showLabels]);

  return (
    <div style={{ width, height, overflow: 'hidden', background: theme.colors.backgroundSubtle, borderRadius: theme.radius.lg }}>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
