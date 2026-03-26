import React, { useState } from 'react';
import { GlassCard, PremiumButton } from './Base';
import { theme } from '../theme';

interface AnnotationField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  options?: string[];
}

interface CodingFormProps {
  fields: AnnotationField[];
  onSubmit: (data: Record<string, any>) => void;
  title?: string;
}

export const CodingForm: React.FC<CodingFormProps> = ({
  fields,
  onSubmit,
  title = "Coding Workspace"
}) => {
  const [data, setData] = useState<Record<string, any>>({});

  const handleChange = (id: string, value: any) => {
    setData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <GlassCard title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {fields.map(field => (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              {field.label}
            </label>
            {field.type === 'text' && (
              <textarea
                style={{
                  background: theme.colors.backgroundSubtle,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: theme.colors.text.primary,
                  minHeight: '80px',
                  outline: 'none',
                }}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}
            {field.type === 'select' && (
              <select
                style={{
                  background: theme.colors.backgroundSubtle,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: theme.colors.text.primary,
                  outline: 'none',
                }}
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                <option value="">Select an option...</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.type === 'boolean' && (
              <input
                type="checkbox"
                onChange={(e) => handleChange(field.id, e.target.checked)}
              />
            )}
          </div>
        ))}
        <PremiumButton onClick={() => onSubmit(data)}>
          Submit Annotation
        </PremiumButton>
      </div>
    </GlassCard>
  );
};
