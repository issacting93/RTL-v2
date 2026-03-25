import React, { useMemo } from 'react';

interface RoleRibbonSegment {
  value: string;
  count: number;
  color: string;
}

interface RoleRibbonProps {
  segments: RoleRibbonSegment[];
  height?: number;
  showLabels?: boolean;
}

export const RoleRibbon: React.FC<RoleRibbonProps> = ({
  segments,
  height = 32,
  showLabels = true,
}) => {
  const total = useMemo(() => segments.reduce((s, seg) => s + seg.count, 0), [segments]);

  return (
    <div>
      <div style={{
        display: 'flex',
        height,
        borderRadius: '6px',
        overflow: 'hidden',
        gap: '1px',
      }}>
        {segments.map((seg, i) => {
          const pct = Math.max((seg.count / total) * 100, 3);
          return (
            <div
              key={i}
              title={`${seg.value} (${seg.count} items)`}
              style={{
                width: `${pct}%`,
                background: seg.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'width 0.3s ease',
              }}
            >
              {showLabels && pct > 10 && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 4px',
                }}>
                  {seg.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#94a3b8',
          marginTop: '4px',
        }}>
          <span>Start</span>
          <span>{total} items</span>
          <span>End</span>
        </div>
      )}
    </div>
  );
};
