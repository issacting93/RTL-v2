import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { vizCardStyle } from '../styles';

interface MosaicPlotProps {
  data: any[];
  rowKey: string;
  colKey: string;
  width?: number;
  height?: number;
  rowLabel?: string;
  colLabel?: string;
}

export const MosaicPlot: React.FC<MosaicPlotProps> = ({
  data,
  rowKey,
  colKey,
  width = 800,
  height = 500,
  rowLabel,
  colLabel
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const plotData = useMemo(() => {
    if (!data.length) return null;

    const margin = { top: 60, right: 140, bottom: 40, left: 140 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Count marginals and joint frequencies
    const rowCounts: Record<string, number> = {};
    const colCounts: Record<string, number> = {};
    const joint: Record<string, number> = {};
    const total = data.length;

    data.forEach(item => {
      const r = item[rowKey] || 'Unknown';
      const c = item[colKey] || 'Unknown';
      rowCounts[r] = (rowCounts[r] || 0) + 1;
      colCounts[c] = (colCounts[c] || 0) + 1;
      const key = `${r}||${c}`;
      joint[key] = (joint[key] || 0) + 1;
    });

    const rowNames = Object.keys(rowCounts).sort((a,b) => rowCounts[b] - rowCounts[a]);
    const colNames = Object.keys(colCounts).sort((a,b) => colCounts[b] - colCounts[a]);

    const colGap = 2;
    const rowGap = 2;

    // Compute column positions and widths
    const cols: any[] = [];
    let xAccum = margin.left;
    colNames.forEach(c => {
      const w = (colCounts[c] / total) * (innerW - colGap * (colNames.length - 1));
      cols.push({ name: c, x: xAccum, w, count: colCounts[c] });
      xAccum += w + colGap;
    });

    // Compute tiles
    const tiles: any[] = [];
    cols.forEach(col => {
      let yAccum = margin.top;
      rowNames.forEach(r => {
        const count = joint[`${r}||${col.name}`] || 0;
        const h = (count / col.count) * (innerH - rowGap * (rowNames.length - 1));

        // Statistical residuals (O-E)/sqrt(E)
        const expected = (rowCounts[r] * col.count) / total;
        const residual = expected > 0 ? (count - expected) / Math.sqrt(expected) : 0;

        tiles.push({
          x: col.x,
          y: yAccum,
          w: col.w,
          h,
          row: r,
          col: col.name,
          count,
          residual,
          expected
        });
        yAccum += h + rowGap;
      });
    });

    return { tiles, margin, innerW, innerH, rowNames, colNames, cols, rowCounts, total };
  }, [data, rowKey, colKey, width, height]);

  useEffect(() => {
    if (!plotData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { tiles, margin, colNames, rowNames, cols, rowCounts, total } = plotData;
    const innerH = height - margin.top - margin.bottom;
    const rowGap = 2;

    // Legend data
    const legendData = [
      { label: 'Positive Association', color: d3.interpolateBlues(0.6) },
      { label: 'Independent', color: '#f1f5f9' },
      { label: 'Negative Association', color: d3.interpolateReds(0.6) }
    ];

    // Tiles
    svg.append('g')
      .selectAll('rect')
      .data(tiles)
      .join('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => Math.max(d.w, 1))
      .attr('height', d => Math.max(d.h, 1))
      .attr('fill', d => {
        if (d.residual > 0.5) return d3.interpolateBlues(Math.min(0.2 + (d.residual / 4) * 0.8, 0.9));
        if (d.residual < -0.5) return d3.interpolateReds(Math.min(0.2 + (-d.residual / 4) * 0.8, 0.9));
        return '#f1f5f9';
      })
      .attr('rx', 2)
      .append('title')
      .text(d => `${d.row} × ${d.col}\nObserved: ${d.count}\nExpected: ${d.expected.toFixed(1)}\nResidual: ${d.residual.toFixed(2)}`);

    // Row Labels
    let yLabelAccum = margin.top;
    rowNames.forEach(r => {
      const h = (rowCounts[r] / total) * (innerH - rowGap * (rowNames.length - 1));
      svg.append('text')
        .attr('x', margin.left - 12)
        .attr('y', yLabelAccum + h / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 10)
        .attr('font-weight', 600)
        .attr('fill', '#475569')
        .text(r);
      yLabelAccum += h + rowGap;
    });

    // Col Labels
    cols.forEach(col => {
       svg.append('text')
        .attr('x', col.x + col.w / 2)
        .attr('y', margin.top - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 600)
        .attr('fill', '#475569')
        .text(col.name);
    });

    // Titles
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', margin.top - 36)
      .attr('font-size', 12)
      .attr('font-weight', 800)
      .attr('fill', '#1e293b')
      .text(`${colLabel || colKey} × ${rowLabel || rowKey}`);

    // Legend
    const legendX = width - 130;
    legendData.forEach((d, i) => {
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', margin.top + i * 20)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', d.color);

      svg.append('text')
        .attr('x', legendX + 18)
        .attr('y', margin.top + i * 20 + 10)
        .attr('font-size', 9)
        .attr('fill', '#64748b')
        .text(d.label);
    });

  }, [plotData, width, height, rowKey, colKey, colLabel, rowLabel, data.length]);

  return (
    <div style={vizCardStyle}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};
