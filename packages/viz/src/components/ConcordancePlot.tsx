import React, { useMemo, useState } from 'react';

interface TermHit {
  docId: string;
  position: number;
  docLength: number;
}

interface ConcordancePlotProps {
  hits: TermHit[];
  docOrder?: string[];
  height?: number;
  width?: number;
  color?: string;
  onDocClick?: (docId: string) => void;
}

const LABEL_WIDTH = 100;
const ROW_GAP = 2;

export const ConcordancePlot: React.FC<ConcordancePlotProps> = ({
  hits,
  docOrder,
  height: rowHeight = 12,
  width = 600,
  color = '#6366f1',
  onDocClick,
}) => {
  const [hoveredDoc, setHoveredDoc] = useState<string | null>(null);

  const { docs, hitsByDoc } = useMemo(() => {
    const hitMap = new Map<string, TermHit[]>();
    for (const hit of hits) {
      if (!hitMap.has(hit.docId)) {
        hitMap.set(hit.docId, []);
      }
      hitMap.get(hit.docId)!.push(hit);
    }

    const orderedDocs = docOrder
      ? docOrder.filter((d) => hitMap.has(d))
      : Array.from(hitMap.keys());

    return { docs: orderedDocs, hitsByDoc: hitMap };
  }, [hits, docOrder]);

  const barWidth = width - LABEL_WIDTH;
  const totalHeight = docs.length * (rowHeight + ROW_GAP);

  return (
    <svg
      width={width}
      height={totalHeight}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {docs.map((docId, rowIndex) => {
        const y = rowIndex * (rowHeight + ROW_GAP);
        const docHits = hitsByDoc.get(docId) || [];
        const isHovered = hoveredDoc === docId;

        return (
          <g
            key={docId}
            style={{ cursor: onDocClick ? 'pointer' : 'default' }}
            onClick={() => onDocClick?.(docId)}
            onMouseEnter={() => setHoveredDoc(docId)}
            onMouseLeave={() => setHoveredDoc(null)}
          >
            {/* Doc label */}
            <text
              x={LABEL_WIDTH - 8}
              y={y + rowHeight / 2}
              textAnchor="end"
              dominantBaseline="central"
              style={{
                fontSize: Math.min(11, rowHeight - 1),
                fill: isHovered ? '#1e293b' : '#64748b',
                fontWeight: isHovered ? 600 : 400,
              }}
            >
              {docId.length > 14 ? docId.slice(0, 13) + '\u2026' : docId}
            </text>

            {/* Background bar */}
            <rect
              x={LABEL_WIDTH}
              y={y}
              width={barWidth}
              height={rowHeight}
              rx={2}
              fill={isHovered ? '#e2e8f0' : '#f1f5f9'}
            />

            {/* Hit marks */}
            {docHits.map((hit, i) => {
              const xPos =
                LABEL_WIDTH +
                (hit.docLength > 0
                  ? (hit.position / hit.docLength) * barWidth
                  : 0);
              return (
                <rect
                  key={i}
                  x={xPos - 1}
                  y={y}
                  width={2}
                  height={rowHeight}
                  fill={color}
                  opacity={isHovered ? 1 : 0.8}
                >
                  <title>
                    {docId} @ position {hit.position}/{hit.docLength}
                  </title>
                </rect>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

export default ConcordancePlot;
