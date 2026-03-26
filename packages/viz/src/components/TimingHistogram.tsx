import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { theme } from '@research-tools/ui';

interface TimingHistogramProps {
  data: { [turn: string]: number };
  width?: number;
  height?: number;
}

export const TimingHistogram: React.FC<TimingHistogramProps> = ({ 
  data, 
  width = 600, 
  height = 300 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const turnData = Object.entries(data)
      .map(([turn, count]) => ({ turn: parseInt(turn), count }))
      .sort((a, b) => a.turn - b.turn);

    const x = d3.scaleBand()
      .domain(turnData.map(d => d.turn.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(turnData, d => d.count) || 0])
      .range([innerHeight, 0])
      .nice();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .call(g => g.select('.domain').attr('stroke', theme.colors.border))
      .selectAll('text')
      .attr('fill', theme.colors.text.secondary)
      .style('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickPadding(10))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', theme.colors.border).attr('stroke-dasharray', '2,2'))
      .selectAll('text')
      .attr('fill', theme.colors.text.secondary)
      .style('font-size', '11px');

    // Bars
    g.selectAll('.bar')
      .data(turnData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.turn.toString()) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.count))
      .attr('fill', theme.colors.orange)
      .attr('rx', 4)
      .attr('opacity', 0.8)
      .on('mouseover', function() {
        d3.select(this).transition().duration(200).attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('opacity', 0.8);
      });

    // Label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', theme.colors.text.secondary)
      .style('font-size', '11px')
      .style('font-weight', 500)
      .text('Turn Number');

  }, [data, width, height]);

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: theme.radius.md,
      padding: '20px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm
    }}>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
