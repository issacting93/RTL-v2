import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme';

interface InspectorField {
  label: string;
  value: string | number;
  color?: string;
}

interface ItemInspectorProps {
  title?: string;
  subtitle?: string;
  fields: InspectorField[];
  accentColor?: string;
  visible?: boolean;
}

export const ItemInspector: React.FC<ItemInspectorProps> = ({
  title,
  subtitle,
  fields,
  accentColor,
  visible = true,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderLeft: accentColor ? `3px solid ${accentColor}` : `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          {title && (
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: theme.colors.text.primary,
              marginBottom: '4px',
            }}>
              {title}
            </div>
          )}
          {subtitle && (
            <div style={{
              fontSize: '12px',
              color: theme.colors.text.secondary,
              marginBottom: '12px',
            }}>
              {subtitle}
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '12px',
          }}>
            {fields.map((f, i) => (
              <div key={i}>
                <div style={{ color: theme.colors.text.secondary, marginBottom: '2px' }}>{f.label}</div>
                <div style={{ color: f.color || theme.colors.text.primary, fontWeight: 500 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
