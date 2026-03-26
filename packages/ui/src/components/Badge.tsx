import React from 'react';
import { theme } from '../theme';

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  color?: string;
  secondary?: string;
  variant?: 'pill' | 'badge' | 'bloom' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  children,
  color = '#6366f1',
  secondary,
  variant = 'badge',
  className = ''
}) => {
  const content = children || label;

  if (variant === 'bloom') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          fontSize: '12px',
          lineHeight: '1.4',
          fontWeight: 500,
          borderRadius: '24px',
          background: 'transparent',
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text.primary,
          transition: 'all 200ms ease',
        }}
      >
        {content}
        {secondary && <span style={{ opacity: 0.6, marginLeft: '4px' }}>{secondary}</span>}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '100px',
          fontSize: '10px',
          fontWeight: 700,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text.secondary,
        }}
      >
        {content}
      </span>
    );
  }

  const isPill = variant === 'pill';
  return (
    <span
      className={className}
      style={{
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
      }}
    >
      {content}
      {secondary && <span style={{ fontSize: '10px', opacity: 0.7 }}>{secondary}</span>}
    </span>
  );
};
