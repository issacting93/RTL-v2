import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { theme } from '@research-tools/ui';

interface StabilityData {
  [className: string]: { n: number };
}

interface StabilityDoughnutProps {
  data: StabilityData;
  size?: number;
}

export const StabilityDoughnut: React.FC<StabilityDoughnutProps> = ({ 
  data, 
  size = 300 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const STABILITY_COLORS: { [key: string]: string } = {
    'Agency Collapse': theme.colors.orange,
    'Constraint Drift': theme.colors.yellow,
    'No Constraints': '#94a3b8',
    'Task Maintained': theme.colors.accent,
    'Task Shift': theme.colors.purple
  };

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = 40;
    const radius = Math.min(size, size) / 2 - margin;

    const g = svg.append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`);

    const pieData = Object.entries(data).map(([label, val]) => ({
      label,
      value: val.n
    }));

    const pie = d3.pie<{ label: string; value: number }>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const outerArc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => STABILITY_COLORS[d.data.label] || '#ccc')
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.8)
      .on('mouseover', function() {
        d3.select(this).transition().duration(200).style('opacity', 1).attr('d', d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
          .innerRadius(radius * 0.6)
          .outerRadius(radius * 1.05) as any);
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).style('opacity', 0.8).attr('d', arc as any);
      });

    // Add labels
    const total = d3.sum(pieData, d => d.value);
    
    // Center text
    const centerText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em');

    centerText.append('tspan')
      .attr('x', 0)
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .attr('fill', theme.colors.text.primary)
      .text(total);

    centerText.append('tspan')
      .attr('x', 0)
      .attr('dy', '1.5em')
      .style('font-size', '12px')
      .attr('fill', theme.colors.text.secondary)
      .text('TOTAL CONVS');

  }, [data, size]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      background: 'white',
      borderRadius: theme.radius.md,
      padding: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm
    }}>
      <svg ref={svgRef} width={size} height={size} />
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        marginTop: '20px',
        width: '100%' 
      }}>
        {Object.entries(STABILITY_COLORS).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', color: theme.colors.text.secondary, whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
