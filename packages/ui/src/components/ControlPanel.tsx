import React from 'react';
import { theme } from '../theme.ts';

interface ToggleOption {
  value: string;
  label: string;
}

interface ControlPanelProps {
  groups: {
    label: string;
    options: ToggleOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'danger' }[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ groups, actions }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      padding: '16px 20px',
      background: theme.colors.surface,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      marginBottom: '24px',
    }}>
      {groups.map((group, gi) => (
        <div key={gi} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingRight: gi < groups.length - 1 ? '20px' : '0',
          borderRight: gi < groups.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: theme.colors.text.secondary }}>
            {group.label}:
          </span>
          {group.options.map(opt => {
            const isActive = group.value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => group.onChange(opt.value)}
                style={{
                  padding: '6px 14px',
                  background: isActive ? theme.colors.text.primary : 'rgba(255,255,255,0.05)',
                  color: isActive ? theme.colors.background : theme.colors.text.primary,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ))}

      {actions && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {actions.map((action, ai) => (
            <button
              key={ai}
              onClick={action.onClick}
              style={{
                padding: '6px 14px',
                background: action.variant === 'danger' ? '#e11d48' : theme.gradients.premium,
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
