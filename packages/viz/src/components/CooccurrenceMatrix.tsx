import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HeatmapData {
  row: string;
  col: string;
  value: number;
}

interface CooccurrenceMatrixProps {
  data: HeatmapData[];
  rows: string[];
  cols: string[];
  width?: number;
  height?: number;
  colorRange?: [string, string];
}

/**
 * A generic co-occurrence heatmap component for cross-dimensional analysis (e.g., D2xD3).
 * Visualizes the intensity of relationships between two sets of categorical dimensions.
 * 
 * @param data - The co-occurrence matrix data points.
 * @param rows - Labels for the Y-axis.
 * @param cols - Labels for the X-axis.
 * @param width - The width of the component.
 * @param height - The height of the component.
 * @param colorRange - Tuple of [minColor, maxColor] for the heatmap gradient.
 */
export const CooccurrenceMatrix: React.FC<CooccurrenceMatrixProps> = ({
  data,
  rows,
  cols,
  width = 600,
  height = 400,
  colorRange = ['#f8fafc', '#6366f1'],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 40, right: 40, bottom: 60, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand().range([0, innerWidth]).domain(cols).padding(0.05);
    const yScale = d3.scaleBand().range([0, innerHeight]).domain(rows).padding(0.05);

    const colorScale = d3.scaleLinear<string>()
      .range(colorRange)
      .domain([0, d3.max(data, d => d.value) || 1]);

    // Draw cells
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.col) || 0)
      .attr('y', d => yScale(d.row) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => colorScale(d.value))
      .style('stroke', 'rgba(255, 255, 255, 0.1)')
      .style('stroke-width', '1');

    // Add labels
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('fill', '#94a3b8');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', '#94a3b8');

  }, [data, rows, cols, width, height, colorRange]);

  return <svg ref={svgRef} width={width} height={height} />;
};
