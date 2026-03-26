import React from 'react';
import { theme } from '../theme';

interface CompactSelectorProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  definitions?: Record<string, string>;
}

export const CompactSelector: React.FC<CompactSelectorProps> = ({
  label,
  options,
  selected,
  onSelect,
  definitions,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: theme.colors.text.secondary,
        marginBottom: '8px',
        letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            title={definitions?.[opt] || ''}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: `1px solid ${selected === opt ? theme.colors.text.primary : theme.colors.border}`,
              background: selected === opt ? theme.colors.text.primary : theme.colors.backgroundSubtle,
              color: selected === opt ? theme.colors.background : theme.colors.text.primary,
              cursor: 'pointer',
              flex: '1 0 calc(50% - 6px)',
              minWidth: '80px',
              transition: 'all 0.15s ease',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

interface TagSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  colorMap?: Record<string, string>;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  options,
  selected,
  onToggle,
  colorMap,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: theme.colors.text.secondary,
        marginBottom: '8px',
        letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {options.map(opt => {
          const isActive = selected.includes(opt);
          const color = colorMap?.[opt] || theme.colors.primary;
          return (
            <div
              key={opt}
              onClick={() => onToggle(opt)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '100px',
                border: `1px solid ${isActive ? color : theme.colors.border}`,
                background: isActive ? color : 'transparent',
                color: isActive ? '#fff' : theme.colors.text.secondary,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
};
