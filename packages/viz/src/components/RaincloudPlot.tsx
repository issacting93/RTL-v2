import React, { useMemo } from 'react';

interface RaincloudGroup {
  label: string;
  values: number[];
  color?: string;
}

interface RaincloudPlotProps {
  groups: RaincloudGroup[];
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

function gaussianKDE(
  values: number[],
  min: number,
  max: number,
  bins: number,
  bandwidth: number
): Array<{ x: number; density: number }> {
  const result: Array<{ x: number; density: number }> = [];
  const step = (max - min) / (bins - 1);
  const n = values.length;
  const sqrt2pi = Math.sqrt(2 * Math.PI);

  for (let i = 0; i < bins; i++) {
    const x = min + i * step;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const z = (x - values[j]) / bandwidth;
      sum += Math.exp(-0.5 * z * z) / (bandwidth * sqrt2pi);
    }
    result.push({ x, density: sum / n });
  }
  return result;
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (pos - lo) * (sorted[hi] - sorted[lo]);
}

// Simple seeded random for reproducible jitter
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const RaincloudPlot: React.FC<RaincloudPlotProps> = ({
  groups,
  width = 500,
  height,
  orientation = 'horizontal',
}) => {
  const layout = useMemo(() => {
    const marginLeft = orientation === 'horizontal' ? 100 : 40;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = orientation === 'horizontal' ? 40 : 100;
    const groupHeight = 90;
    const groupGap = 12;

    const computedHeight =
      height ??
      marginTop + groups.length * (groupHeight + groupGap) - groupGap + marginBottom;

    // Global value range
    const allValues = groups.flatMap((g) => g.values);
    if (allValues.length === 0) {
      return {
        computedHeight,
        marginLeft,
        marginRight,
        marginTop,
        marginBottom,
        groupHeight,
        groupGap,
        globalMin: 0,
        globalMax: 1,
        scaleVal: () => marginLeft,
        groupData: [],
      };
    }

    const globalMin = Math.min(...allValues);
    const globalMax = Math.max(...allValues);
    const pad = (globalMax - globalMin) * 0.08 || 1;
    const domMin = globalMin - pad;
    const domMax = globalMax + pad;

    const plotLength =
      orientation === 'horizontal'
        ? width - marginLeft - marginRight
        : computedHeight - marginTop - marginBottom;

    const scaleVal = (v: number) => {
      const t = (v - domMin) / (domMax - domMin);
      return orientation === 'horizontal'
        ? marginLeft + t * plotLength
        : marginTop + t * plotLength;
    };

    const groupData = groups.map((group, gi) => {
      const sorted = [...group.values].sort((a, b) => a - b);
      const n = sorted.length;
      if (n === 0) return null;

      const q1 = quantile(sorted, 0.25);
      const median = quantile(sorted, 0.5);
      const q3 = quantile(sorted, 0.75);
      const iqr = q3 - q1;
      const whiskerLow = Math.max(sorted[0], q1 - 1.5 * iqr);
      const whiskerHigh = Math.min(sorted[n - 1], q3 + 1.5 * iqr);

      // KDE
      const bandwidth = 1.06 * (standardDeviation(sorted) || 1) * Math.pow(n, -0.2);
      const kde = gaussianKDE(sorted, domMin, domMax, 30, bandwidth);
      const maxDensity = Math.max(...kde.map((p) => p.density));

      const color = group.color ?? DEFAULT_COLORS[gi % DEFAULT_COLORS.length];

      // Jittered points
      const rng = seededRandom(gi * 1000 + 42);
      const jitteredPoints = sorted.map((v) => ({
        value: v,
        jitter: rng() * 0.8 + 0.1, // 0.1 to 0.9
      }));

      return {
        label: group.label,
        sorted,
        q1,
        median,
        q3,
        whiskerLow,
        whiskerHigh,
        kde,
        maxDensity,
        color,
        jitteredPoints,
      };
    });

    return {
      computedHeight,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      groupHeight,
      groupGap,
      globalMin: domMin,
      globalMax: domMax,
      scaleVal,
      groupData,
    };
  }, [groups, width, height, orientation]);

  const {
    computedHeight,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    groupHeight,
    groupGap,
    globalMin,
    globalMax,
    scaleVal,
    groupData,
  } = layout;

  // Axis ticks
  const ticks = useMemo(() => {
    const range = globalMax - globalMin;
    if (range === 0) return [globalMin];
    const rawStep = range / 6;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / magnitude;
    const step =
      norm <= 1.5
        ? magnitude
        : norm <= 3
          ? 2 * magnitude
          : norm <= 7
            ? 5 * magnitude
            : 10 * magnitude;
    const result: number[] = [];
    let tick = Math.ceil(globalMin / step) * step;
    while (tick <= globalMax) {
      result.push(tick);
      tick += step;
    }
    return result;
  }, [globalMin, globalMax]);

  const isH = orientation === 'horizontal';

  return (
    <svg
      width={width}
      height={computedHeight}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {/* Groups */}
      {groupData.map((gd, gi) => {
        if (!gd) return null;

        const groupY = marginTop + gi * (groupHeight + groupGap);
        const violinHeight = groupHeight * 0.35;
        const boxY = groupY + violinHeight + 2;
        const boxHeight = groupHeight * 0.2;
        const stripY = boxY + boxHeight + 4;
        const stripHeight = groupHeight * 0.3;

        // Build violin path
        const violinPath = (() => {
          const points = gd.kde.map((p) => ({
            val: scaleVal(p.x),
            density: (p.density / gd.maxDensity) * violinHeight,
          }));

          if (isH) {
            const top = points
              .map((p) => `${p.val},${groupY + violinHeight - p.density}`)
              .join(' L ');
            const base = `${points[0].val},${groupY + violinHeight}`;
            const baseEnd = `${points[points.length - 1].val},${groupY + violinHeight}`;
            return `M ${base} L ${top} L ${baseEnd} Z`;
          } else {
            const left = points
              .map((p) => `${groupY + violinHeight - p.density},${p.val}`)
              .join(' L ');
            const base = `${groupY + violinHeight},${points[0].val}`;
            const baseEnd = `${groupY + violinHeight},${points[points.length - 1].val}`;
            return `M ${base} L ${left} L ${baseEnd} Z`;
          }
        })();

        return (
          <g key={gi}>
            {/* Label */}
            {isH ? (
              <text
                x={marginLeft - 8}
                y={groupY + groupHeight / 2}
                textAnchor="end"
                dominantBaseline="central"
                style={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
              >
                {gd.label}
              </text>
            ) : (
              <text
                x={groupY + groupHeight / 2}
                y={computedHeight - marginBottom + 14}
                textAnchor="middle"
                dominantBaseline="hanging"
                style={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
              >
                {gd.label}
              </text>
            )}

            {/* Half violin */}
            <path d={violinPath} fill={gd.color} opacity={0.3} />

            {/* Boxplot */}
            {isH ? (
              <g>
                {/* Whiskers */}
                <line
                  x1={scaleVal(gd.whiskerLow)}
                  y1={boxY + boxHeight / 2}
                  x2={scaleVal(gd.q1)}
                  y2={boxY + boxHeight / 2}
                  stroke={gd.color}
                  strokeWidth={1.5}
                />
                <line
                  x1={scaleVal(gd.q3)}
                  y1={boxY + boxHeight / 2}
                  x2={scaleVal(gd.whiskerHigh)}
                  y2={boxY + boxHeight / 2}
                  stroke={gd.color}
                  strokeWidth={1.5}
                />
                {/* Box */}
                <rect
                  x={scaleVal(gd.q1)}
                  y={boxY}
                  width={scaleVal(gd.q3) - scaleVal(gd.q1)}
                  height={boxHeight}
                  fill={gd.color}
                  opacity={0.5}
                  stroke={gd.color}
                  strokeWidth={1.5}
                  rx={2}
                />
                {/* Median */}
                <line
                  x1={scaleVal(gd.median)}
                  y1={boxY}
                  x2={scaleVal(gd.median)}
                  y2={boxY + boxHeight}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            ) : (
              <g>
                <line
                  x1={boxY + boxHeight / 2}
                  y1={scaleVal(gd.whiskerLow)}
                  x2={boxY + boxHeight / 2}
                  y2={scaleVal(gd.q1)}
                  stroke={gd.color}
                  strokeWidth={1.5}
                />
                <line
                  x1={boxY + boxHeight / 2}
                  y1={scaleVal(gd.q3)}
                  x2={boxY + boxHeight / 2}
                  y2={scaleVal(gd.whiskerHigh)}
                  stroke={gd.color}
                  strokeWidth={1.5}
                />
                <rect
                  x={boxY}
                  y={scaleVal(gd.q1)}
                  width={boxHeight}
                  height={scaleVal(gd.q3) - scaleVal(gd.q1)}
                  fill={gd.color}
                  opacity={0.5}
                  stroke={gd.color}
                  strokeWidth={1.5}
                  rx={2}
                />
                <line
                  x1={boxY}
                  y1={scaleVal(gd.median)}
                  x2={boxY + boxHeight}
                  y2={scaleVal(gd.median)}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            )}

            {/* Jittered strip */}
            {gd.jitteredPoints.map((pt, pi) =>
              isH ? (
                <circle
                  key={pi}
                  cx={scaleVal(pt.value)}
                  cy={stripY + pt.jitter * stripHeight}
                  r={2}
                  fill={gd.color}
                  opacity={0.6}
                />
              ) : (
                <circle
                  key={pi}
                  cx={stripY + pt.jitter * stripHeight}
                  cy={scaleVal(pt.value)}
                  r={2}
                  fill={gd.color}
                  opacity={0.6}
                />
              )
            )}
          </g>
        );
      })}

      {/* Axis */}
      {isH ? (
        <g>
          <line
            x1={marginLeft}
            y1={computedHeight - marginBottom}
            x2={width - marginRight}
            y2={computedHeight - marginBottom}
            stroke="#6b7280"
            strokeWidth={1}
          />
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={scaleVal(t)}
                y1={computedHeight - marginBottom}
                x2={scaleVal(t)}
                y2={computedHeight - marginBottom + 5}
                stroke="#6b7280"
                strokeWidth={1}
              />
              <text
                x={scaleVal(t)}
                y={computedHeight - marginBottom + 16}
                textAnchor="middle"
                style={{ fontSize: 10, fill: '#6b7280' }}
              >
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            </g>
          ))}
        </g>
      ) : (
        <g>
          <line
            x1={marginLeft - 10}
            y1={marginTop}
            x2={marginLeft - 10}
            y2={computedHeight - marginBottom}
            stroke="#6b7280"
            strokeWidth={1}
          />
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={marginLeft - 15}
                y1={scaleVal(t)}
                x2={marginLeft - 10}
                y2={scaleVal(t)}
                stroke="#6b7280"
                strokeWidth={1}
              />
              <text
                x={marginLeft - 18}
                y={scaleVal(t)}
                textAnchor="end"
                dominantBaseline="central"
                style={{ fontSize: 10, fill: '#6b7280' }}
              >
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

function standardDeviation(sorted: number[]): number {
  const n = sorted.length;
  if (n < 2) return 0;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

export default RaincloudPlot;
