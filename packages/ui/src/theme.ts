// ── Bloom Design System Tokens ──────────────────────────────────

export const theme = {
  colors: {
    primary: '#6366f1',    // Indigo
    secondary: '#ec4899',  // Pink
    accent: '#22c55e',     // Green
    background: '#ffffff',
    backgroundSubtle: '#f8f8f8',
    surface: '#ffffff',
    text: {
      primary: '#1a1a1a',
      secondary: '#888888',
    },
    border: '#e5e5e5',
    yellow: '#f5c542',
    orange: '#e85a3c',
    purple: '#8b5cf6',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  gradients: {
    premium: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  },
};

/** Standard card container style for UI components. */
export const cardStyle = {
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadows.sm,
};

/** Standard card container style for viz/chart wrappers. */
export const vizCardStyle = {
  background: theme.colors.surface,
  borderRadius: theme.radius.lg,
  padding: '24px',
  border: `1px solid ${theme.colors.border}`,
  boxShadow: theme.shadows.sm,
  overflow: 'hidden' as const,
};
