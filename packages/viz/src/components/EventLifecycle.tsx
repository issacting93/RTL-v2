import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { vizCardStyle } from '../styles';

interface LifecycleEvent {
  idx: number;
  type: 'trigger' | 'violation' | 'repair' | 'ratify' | 'info';
  label: string;
  constraintId: string;
}

interface EventLifecycleProps {
  events: LifecycleEvent[];
  maxTurns: number;
  width?: number;
  height?: number;
}

export const EventLifecycle: React.FC<EventLifecycleProps> = ({
  events,
  maxTurns,
  width = 800,
  height = 400
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const plotData = useMemo(() => {
    if (!events.length) return null;

    const margin = { top: 40, right: 60, bottom: 40, left: 140 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const constraintGroups = d3.groups(events, d => d.constraintId);
    const rowH = Math.min(60, innerH / Math.max(constraintGroups.length, 1));

    const colorMap: Record<string, string> = {
      trigger: '#fbbf24',
      violation: '#ef4444',
      repair: '#22c55e',
      ratify: '#8b5cf6',
      info: '#64748b'
    };

    return { constraintGroups, margin, innerW, innerH, rowH, colorMap };
  }, [events, width, height]);

  useEffect(() => {
    if (!plotData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { constraintGroups, margin, innerW, rowH, colorMap } = plotData;

    const xScale = d3.scaleLinear()
      .domain([0, maxTurns])
      .range([margin.left, margin.left + innerW]);

    const g = svg.append('g');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d => `Turn ${d}`);
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', 10);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(10))
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '2,2');

    // Rows
    constraintGroups.forEach((group, i) => {
      const constraintId = group[0];
      const gEvents = group[1].sort((a,b) => a.idx - b.idx);
      const y = margin.top + i * rowH + rowH / 2;

      // Track line
      g.append('line')
        .attr('x1', margin.left)
        .attr('x2', margin.left + innerW)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 4)
        .attr('stroke-linecap', 'round');

      // Labels
      g.append('text')
        .attr('x', margin.left - 12)
        .attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .attr('font-weight', 700)
        .attr('fill', '#1e293b')
        .text(constraintId);

      // Event Markers
      g.selectAll(`.event-${i}`)
        .data(gEvents)
        .join('circle')
        .attr('cx', d => xScale(d.idx))
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', d => colorMap[d.type] || '#64748b')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .on('mouseenter', function(this: any) { d3.select(this).attr('r', 8); })
        .on('mouseleave', function(this: any) { d3.select(this).attr('r', 6); })
        .append('title')
        .text(d => `${d.label} (Turn ${d.idx})\nType: ${d.type}`);
    });

    // Legend
    const legendX = margin.left;
    const legendY = margin.top - 20;
    const entries = Object.entries(colorMap);
    entries.forEach(([type, color], i) => {
       const leg = svg.append('g').attr('transform', `translate(${legendX + i * 80}, ${legendY})`);
       leg.append('circle').attr('r', 4).attr('fill', color);
       leg.append('text').attr('x', 8).attr('y', 4).attr('font-size', 10).attr('fill', '#64748b').text(type.toUpperCase());
    });

  }, [plotData, maxTurns, height]);

  return (
    <div style={vizCardStyle}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};
