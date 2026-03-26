import React from 'react';
import { theme } from '../theme';

interface BarDistributionProps {
  data: { label: string; count: number; color?: string }[];
  title?: string;
}

export const BarDistribution: React.FC<BarDistributionProps> = ({ data, title }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div>
      {title && (
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: theme.colors.text.primary,
          marginBottom: '12px',
        }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map(d => {
          const pct = Math.round((d.count / total) * 100);
          const color = d.color || theme.colors.primary;
          return (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ minWidth: '100px', fontSize: '13px', color: theme.colors.text.primary }}>
                {d.label}
              </div>
              <div style={{
                flex: 1,
                height: '8px',
                background: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{
                minWidth: '60px',
                textAlign: 'right',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: theme.colors.text.secondary,
              }}>
                {d.count} <span style={{ opacity: 0.5 }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
