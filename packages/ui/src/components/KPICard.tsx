import React from 'react';
import { theme } from '../theme';

interface KPICardProps {
  label: string;
  value: string | number;
  detail?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, detail, color, icon }) => {
  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.radius.md,
      padding: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      transition: 'box-shadow 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    }}>
      {icon && (
        <div style={{
          padding: '12px',
          background: theme.colors.backgroundSubtle,
          borderRadius: theme.radius.sm,
          border: `1px solid ${theme.colors.border}`,
          transition: 'background 0.3s ease',
        }}>
           {icon}
        </div>
      )}
      <div>
        <div style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: theme.colors.text.secondary,
          letterSpacing: '0.1em',
          marginBottom: '4px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: color || theme.colors.text.primary,
        }}>
          {value}
        </div>
        {detail && (
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginTop: '4px',
            fontWeight: 500,
          }}>
            {detail}
          </div>
        )}
      </div>
    </div>
  );
};

interface KPIGridProps {
  items: KPICardProps[];
  columns?: number;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ items, columns = 4 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {items.map((item, i) => (
        <KPICard key={i} {...item} />
      ))}
    </div>
  );
};
