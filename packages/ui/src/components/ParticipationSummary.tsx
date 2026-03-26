import React from 'react';
import { theme } from '../theme';

interface RoleDist {
  [key: string]: number;
}

interface ParticipationSummaryProps {
  humanRoleDist?: RoleDist | null;
  aiRoleDist?: RoleDist | null;
}

export const ParticipationSummary: React.FC<ParticipationSummaryProps> = ({ humanRoleDist, aiRoleDist }) => {
  const renderBars = (dist: RoleDist, type: 'human' | 'ai') => {
    const sorted = Object.entries(dist)
      .filter(([_, value]) => value >= 0.01)
      .sort((a, b) => b[1] - a[1]);

    const color = type === 'human' ? theme.colors.primary : theme.colors.secondary;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map(([role, value]) => {
          const pct = Math.round(value * 100);
          return (
            <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: theme.colors.text.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {role}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  fontFamily: 'monospace', 
                  color: theme.colors.text.secondary 
                }}>
                  {pct}%
                </span>
              </div>
              <div style={{
                height: '6px',
                background: theme.colors.backgroundSubtle,
                borderRadius: '3px',
                overflow: 'hidden',
                border: `1px solid ${theme.colors.border}`
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: '3px',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!humanRoleDist && !aiRoleDist) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {humanRoleDist && (
        <section>
          <h3 style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            color: theme.colors.text.secondary,
            marginBottom: '12px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '4px',
            letterSpacing: '0.1em'
          }}>
            Human Role Distribution
          </h3>
          {renderBars(humanRoleDist, 'human')}
        </section>
      )}

      {aiRoleDist && (
        <section>
          <h3 style={{ 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            color: theme.colors.text.secondary,
            marginBottom: '12px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '4px',
            letterSpacing: '0.1em'
          }}>
            AI Role Distribution
          </h3>
          {renderBars(aiRoleDist, 'ai')}
        </section>
      )}
    </div>
  );
};
