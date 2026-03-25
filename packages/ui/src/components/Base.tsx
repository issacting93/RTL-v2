import React from 'react';
import { motion } from 'framer-motion';
import { glassStyle, theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * A premium glassmorphism card container.
 */
export const GlassCard: React.FC<CardProps> = ({ children, title, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ ...glassStyle, padding: '20px' }}
      className={className}
    >
      {title && (
        <h3 style={{ 
          color: theme.colors.text.primary, 
          marginBottom: '16px',
          fontSize: '1.25rem',
          fontWeight: 600,
          background: theme.gradients.premium,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
};

export const PremiumButton: React.FC<{ 
  onClick: () => void; 
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}> = ({ onClick, children, variant = 'primary' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: variant === 'primary' ? theme.gradients.premium : 'transparent',
        border: variant === 'primary' ? 'none' : `1px solid ${theme.colors.primary}`,
        color: theme.colors.text.primary,
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        transition: 'all 0.3s ease',
      }}
    >
      {children}
    </motion.button>
  );
};
