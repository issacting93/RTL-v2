import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { vizCardStyle } from '../styles';

interface ParallelSetDim {
  key: string;
  label: string;
}

interface ParallelSetsProps {
  data: any[];
  dimensions: ParallelSetDim[];
  width?: number;
  height?: number;
  colorScale?: (val: string) => string;
}

export const ParallelSets: React.FC<ParallelSetsProps> = ({
  data,
  dimensions,
  width = 800,
  height = 500,
  colorScale
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const plotData = useMemo(() => {
    if (!data.length || !dimensions.length) return null;

    const margin = { top: 60, right: 120, bottom: 40, left: 120 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const dims = dimensions.map((d, i) => ({
      ...d,
      x: margin.left + (i / (dimensions.length - 1)) * innerW,
      categories: [] as any[],
      total: data.length
    }));

    // Compute categories for each dimension
    dims.forEach(dim => {
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const val = item[dim.key] || 'Unknown';
        counts[val] = (counts[val] || 0) + 1;
      });
      dim.categories = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, yUsed: 0 }));
    });

    const catGap = 6;
    dims.forEach(dim => {
      let yAccum = margin.top;
      const totalGap = catGap * (dim.categories.length - 1);
      const availableH = innerH - totalGap;

      dim.categories.forEach(cat => {
        cat.h = (cat.count / dim.total) * availableH;
        cat.y = yAccum;
        yAccum += cat.h + catGap;
      });
    });

    // Compute ribbons (flows between adjacent dimensions)
    const ribbons: any[] = [];
    for (let i = 0; i < dims.length - 1; i++) {
      const dimA = dims[i];
      const dimB = dims[i+1];

      const flows: Record<string, number> = {};
      data.forEach(item => {
        const valA = item[dimA.key] || 'Unknown';
        const valB = item[dimB.key] || 'Unknown';
        const key = `${valA}||${valB}`;
        flows[key] = (flows[key] || 0) + 1;
      });

      Object.entries(flows).forEach(([key, count]) => {
        const [nameA, nameB] = key.split('||');
        const catA = dimA.categories.find(c => c.name === nameA);
        const catB = dimB.categories.find(c => c.name === nameB);
        if (!catA || !catB) return;

        const hA = (count / dimA.total) * (innerH - catGap * (dimA.categories.length - 1));
        const hB = (count / dimB.total) * (innerH - catGap * (dimB.categories.length - 1));

        ribbons.push({
          x1: dimA.x + 4,
          x2: dimB.x - 4,
          y1: catA.y + catA.yUsed,
          y2: catB.y + catB.yUsed,
          h: hA,
          id: `${dimA.key}-${dimB.key}-${key}`,
          color: colorScale ? colorScale(nameA) : '#cbd5e1',
          tooltip: `${nameA} → ${nameB}: ${count}`
        });

        catA.yUsed += hA;
        catB.yUsed += hB;
      });
    }

    return { dims, ribbons, margin };
  }, [data, dimensions, width, height, colorScale]);

  useEffect(() => {
    if (!plotData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { dims, ribbons } = plotData;

    // Drawing Ribbons
    const ribbonG = svg.append('g').attr('class', 'ribbons');
    ribbons.forEach((r: any) => {
      const path = d3.path();
      path.moveTo(r.x1, r.y1);
      path.bezierCurveTo((r.x1 + r.x2) / 2, r.y1, (r.x1 + r.x2) / 2, r.y2, r.x2, r.y2);
      path.lineTo(r.x2, r.y2 + r.h);
      path.bezierCurveTo((r.x1 + r.x2) / 2, r.y2 + r.h, (r.x1 + r.x2) / 2, r.y1 + r.h, r.x1, r.y1 + r.h);
      path.closePath();

      ribbonG.append('path')
        .attr('d', path.toString())
        .attr('fill', r.color)
        .attr('opacity', 0.2)
        .attr('stroke', r.color)
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.3)
        .on('mouseenter', function() { d3.select(this).attr('opacity', 0.5); })
        .on('mouseleave', function() { d3.select(this).attr('opacity', 0.2); })
        .append('title').text(r.tooltip);
    });

    // Drawing Nodes (Bars)
    const nodeG = svg.append('g').attr('class', 'nodes');
    dims.forEach((dim, di) => {
      dim.categories.forEach(cat => {
        const color = colorScale ? colorScale(cat.name) : '#94a3b8';
        nodeG.append('rect')
          .attr('x', dim.x - 4)
          .attr('y', cat.y)
          .attr('width', 8)
          .attr('height', Math.max(cat.h, 2))
          .attr('rx', 2)
          .attr('fill', color)
          .append('title').text(`${cat.name}: ${cat.count}`);

        const anchor = di === 0 ? 'end' : di === dims.length - 1 ? 'start' : 'middle';
        const dx = di === 0 ? -12 : di === dims.length - 1 ? 12 : 0;

        if (cat.h > 10) {
          nodeG.append('text')
            .attr('x', dim.x + dx)
            .attr('y', cat.y + cat.h / 2 + 4)
            .attr('text-anchor', anchor)
            .attr('font-size', 10)
            .attr('font-weight', 600)
            .attr('fill', '#475569')
            .text(cat.name);
        }
      });

      // Axis Labels
      nodeG.append('text')
        .attr('x', dim.x)
        .attr('y', plotData.margin.top - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 800)
        .attr('fill', '#1e293b')
        .text(dim.label);
    });

  }, [plotData, colorScale]);

  return (
    <div style={vizCardStyle}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};
