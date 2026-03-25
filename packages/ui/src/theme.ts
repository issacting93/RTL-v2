export const theme = {
  colors: {
    primary: '#6366f1', // Indigo
    secondary: '#ec4899', // Pink
    accent: '#10b981', // Emerald
    background: '#0f172a', // Slate 900
    surface: 'rgba(30, 41, 59, 0.7)', // Glass surface
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    border: 'rgba(255, 255, 255, 0.1)',
  },
  blur: 'backdrop-blur-lg',
  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  gradients: {
    premium: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    surface: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
  }
};

export const glassStyle = {
  background: theme.colors.surface,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${theme.colors.border}`,
  boxShadow: theme.shadows.glass,
  borderRadius: '16px',
};
