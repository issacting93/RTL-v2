import React from 'react';
import { theme } from '../theme.ts';

interface KPICardProps {
  label: string;
  value: string | number;
  detail?: string;
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, detail, color }) => {
  return (
    <div style={{
      background: theme.colors.surface,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '16px',
    }}>
      <div style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        color: theme.colors.text.secondary,
        marginBottom: '8px',
        fontWeight: 600,
        letterSpacing: '0.04em',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: color || theme.colors.text.primary,
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginTop: '4px' }}>
          {detail}
        </div>
      )}
    </div>
  );
};

interface KPIGridProps {
  items: KPICardProps[];
  columns?: number;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ items, columns = 4 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px',
    }}>
      {items.map((item, i) => (
        <KPICard key={i} {...item} />
      ))}
    </div>
  );
};
