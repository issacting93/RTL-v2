import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { vizCardStyle } from '../styles';

interface AffectiveDataPoint {
  idx: number;
  p: number;
  a: number;
  d: number;
}

interface AffectiveSparklinesProps {
  data: AffectiveDataPoint[];
  width?: number;
  height?: number;
  labels?: string[];
}

export const AffectiveSparklines: React.FC<AffectiveSparklinesProps> = ({
  data,
  width = 800,
  height = 300,
  labels = ['Pleasure', 'Arousal', 'Dominance']
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const plotData = useMemo(() => {
    if (!data.length) return null;

    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.idx) || 1])
      .range([margin.left, margin.left + innerW]);

    const yScale = d3.scaleLinear()
      .domain([-1, 1]) // standard PAD range
      .range([margin.top + innerH, margin.top]);

    const colors = ['#22c55e', '#f97316', '#3b82f6']; // Green, Orange, Blue

    return { xScale, yScale, margin, colors, innerW, innerH };
  }, [data, width, height]);

  useEffect(() => {
    if (!plotData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { xScale, yScale, margin, colors } = plotData;

    // Shared defs for gradients
    const defs = svg.append('defs');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0, ${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(0))
      .attr('color', '#e2e8f0');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#94a3b8');

    // Lines
    const lineNames: (keyof AffectiveDataPoint)[] = ['p', 'a', 'd'];
    lineNames.forEach((key, i) => {
      const line = d3.line<AffectiveDataPoint>()
        .x(d => xScale(d.idx))
        .y(d => yScale(Number(d[key]) || 0))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors[i])
        .attr('stroke-width', 2.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line)
        .attr('opacity', 0.8);

      // Gradient area
      const area = d3.area<AffectiveDataPoint>()
        .x(d => xScale(d.idx))
        .y0(yScale(0))
        .y1(d => yScale(Number(d[key]) || 0))
        .curve(d3.curveMonotoneX);

      const gradientId = `grad-${key}`;
      const grad = defs.append('linearGradient').attr('id', gradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', colors[i]).attr('stop-opacity', 0.2);
      grad.append('stop').attr('offset', '100%').attr('stop-color', colors[i]).attr('stop-opacity', 0);

      svg.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', area);
    });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${margin.left}, 20)`);
    labels.forEach((label, i) => {
       const leg = legend.append('g').attr('transform', `translate(${i * 120}, 0)`);
       leg.append('circle').attr('r', 5).attr('fill', colors[i]);
       leg.append('text').attr('x', 12).attr('y', 5).attr('font-size', 11).attr('font-weight', 600).attr('fill', '#475569').text(label);
    });

    // Tooltip Tracker
    const focus = svg.append('g').style('display', 'none');
    focus.append('line').attr('class', 'x-hover-line').attr('y1', margin.top).attr('y2', height - margin.bottom).attr('stroke', '#cbd5e1').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', function(event) {
        const x0 = xScale.invert(d3.pointer(event)[0]);
        const bisect = d3.bisector((d: AffectiveDataPoint) => d.idx).left;
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        if (!d0 || !d1) return;
        const d = x0 - d0.idx > d1.idx - x0 ? d1 : d0;
        focus.attr('transform', `translate(${xScale(d.idx)}, 0)`);
      });

  }, [plotData, data, width, height, labels]);

  return (
    <div style={vizCardStyle}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};
