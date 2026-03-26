import React, { useMemo } from 'react';
import { vizCardStyle, vizColors } from '../styles';

interface ParadoxHeatmapProps {
  data: Record<string, number[]>; // tier -> array of counts for each bin
  bins?: number;
  width?: number;
  height?: number;
  title?: string;
}

export const ParadoxHeatmap: React.FC<ParadoxHeatmapProps> = ({
  data,
  bins = 10,
  title = "Paradox Escalation"
}) => {
  const tiers = ['High', 'Moderate', 'Low'];

  const heatmapData = useMemo(() => {
    const allValues = Object.values(data).flat();
    const max = Math.max(1, ...allValues);

    return {
      tiers,
      max,
      binLabels: Array.from({ length: bins }, (_, i) => `${i * 10}%–${(i + 1) * 10}%`)
    };
  }, [data, bins]);

  const colorMap: Record<string, string> = {
    High: '#ef4444',
    Moderate: '#f97316',
    Low: '#94a3b8'
  };

  const dimLabel: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    color: vizColors.textDim,
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
  };

  return (
    <div style={vizCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: vizColors.text }}>{title}</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          {tiers.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap[t], display: 'inline-block' }} />
              <span style={dimLabel}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(10, 1fr)', marginBottom: '8px' }}>
            <div />
            {heatmapData.binLabels.map(l => (
              <div key={l} style={{ fontSize: '9px', fontWeight: 900, color: vizColors.textDim, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                {l}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tiers.map(tier => (
              <div key={tier} style={{ display: 'grid', gridTemplateColumns: '100px repeat(10, 1fr)', alignItems: 'center', height: '48px', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <span style={{
                     padding: '4px 8px',
                     background: vizColors.bgSubtle,
                     border: `1px solid ${vizColors.border}`,
                     borderRadius: '4px',
                     fontSize: '10px',
                     fontWeight: 900,
                     color: vizColors.text,
                     textTransform: 'uppercase',
                     letterSpacing: '-0.01em',
                   }}>
                    {tier}
                   </span>
                </div>
                {(data[tier] || Array(bins).fill(0)).map((val, bi) => {
                  const intensity = val / heatmapData.max;
                  const alpha = val > 0 ? 0.05 + intensity * 0.85 : 0.03;
                  const color = colorMap[tier];
                  const hasValue = val > 0;

                  return (
                    <div
                      key={bi}
                      style={{
                        height: '100%',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        background: hasValue ? `${color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}` : '#f8fafc',
                        border: hasValue ? `1px solid ${color}33` : '1px solid transparent',
                      }}
                      title={`${tier} Paradox: ${val} turns in ${heatmapData.binLabels[bi]}`}
                    >
                      {hasValue && (
                        <span style={{ fontSize: '11px', fontWeight: 900, color: alpha > 0.5 ? '#fff' : color }}>
                          {val}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
