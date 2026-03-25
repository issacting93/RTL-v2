import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../theme.ts';
import { Message } from '@research-tools/core';

interface TranscriptViewerProps {
  messages: Message[];
  onMessageClick?: (id: string) => void;
  highlightedId?: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ 
  messages, 
  onMessageClick,
  highlightedId 
}) => {
  return (
    <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {messages.map((m, i) => (
        <motion.div
          key={m.id || i}
          initial={{ opacity: 0, x: m.speaker === 'user' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onMessageClick?.(m.id)}
          style={{
            alignSelf: m.speaker === 'user' ? 'flex-start' : 'flex-end',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: m.speaker === 'user' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.15)',
            border: highlightedId === m.id ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
            cursor: onMessageClick ? 'pointer' : 'default',
          }}
        >
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '4px', textTransform: 'uppercase' }}>
            {m.speaker} {m.role ? `• ${m.role}` : ''}
          </div>
          <div style={{ color: theme.colors.text.primary, lineHeight: '1.5' }}>
            {m.content}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
