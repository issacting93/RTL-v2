import React from 'react';
import { vizCardStyle, vizColors } from '../styles';

interface DominanceGaugeProps {
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
  colorA?: string;
  colorB?: string;
  title?: string;
}

export const DominanceGauge: React.FC<DominanceGaugeProps> = ({
  labelA,
  valueA,
  labelB,
  valueB,
  colorA = '#3b82f6',
  colorB = '#ef4444',
  title = "Dominance Balance"
}) => {
  const total = valueA + valueB || 1;
  const pctA = (valueA / total) * 100;
  const pctB = (valueB / total) * 100;

  const dimLabel: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    color: vizColors.textDim,
    textTransform: 'uppercase',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  };

  return (
    <div style={vizCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: vizColors.text }}>{title}</h3>
        <div style={{ ...dimLabel, marginBottom: 0, letterSpacing: '0.1em' }}>
           {total} Turns Total
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Participation Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={dimLabel}>{labelA}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: vizColors.text }}>{Math.round(pctA)}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={dimLabel}>{labelB}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: vizColors.text }}>{Math.round(pctB)}%</div>
          </div>
        </div>

        {/* The Gauge Bar */}
        <div style={{
          position: 'relative',
          height: '16px',
          background: vizColors.bgSubtle,
          borderRadius: '100px',
          overflow: 'hidden',
          border: `1px solid ${vizColors.border}`,
          display: 'flex',
        }}>
          <div style={{
            height: '100%',
            width: `${pctA}%`,
            background: colorA,
            transition: 'width 0.7s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 8px',
          }}>
             {pctA > 15 && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', opacity: 0.5 }} />}
          </div>
          <div style={{
            height: '100%',
            width: `${pctB}%`,
            background: colorB,
            transition: 'width 0.7s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 8px',
          }}>
             {pctB > 15 && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', opacity: 0.5 }} />}
          </div>

          {/* Center Marker */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#fff',
            opacity: 0.4,
          }} />
        </div>

        {/* Detail text */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500, color: vizColors.textDim }}>
           <span>{valueA} Absolute Units</span>
           <span>{valueB} Absolute Units</span>
        </div>
      </div>
    </div>
  );
};
