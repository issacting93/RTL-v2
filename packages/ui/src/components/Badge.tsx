import React from 'react';

interface BadgeProps {
  label: string;
  color?: string;
  secondary?: string;
  variant?: 'pill' | 'badge';
}

export const Badge: React.FC<BadgeProps> = ({ label, color = '#6366f1', secondary, variant = 'badge' }) => {
  const isPill = variant === 'pill';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: isPill ? '3px 10px' : '2px 8px',
      borderRadius: isPill ? '100px' : '6px',
      fontSize: '12px',
      fontWeight: 600,
      background: `${color}18`,
      color: color,
      border: isPill ? `1px solid ${color}33` : 'none',
      whiteSpace: 'nowrap',
    }}>
      {label}
      {secondary && <span style={{ fontSize: '10px', opacity: 0.7 }}>{secondary}</span>}
    </span>
  );
};
