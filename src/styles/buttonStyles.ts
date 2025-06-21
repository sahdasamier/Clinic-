// Enhanced Button Styles for Clinic Application
import { Theme } from '@mui/material/styles';

export const buttonStyles = {
  // Primary Action Button
  primaryAction: {
    borderRadius: 3,
    fontWeight: 700,
    px: { xs: 3, md: 4 },
    py: { xs: 1.5, md: 1.5 },
    minHeight: 48,
    fontSize: { xs: '0.875rem', md: '1rem' },
    minWidth: { xs: 'auto', sm: 140 },
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textTransform: 'none' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
    },
    transition: 'all 0.3s ease'
  },

  // Secondary Action Button
  secondaryAction: {
    borderRadius: 3,
    fontWeight: 600,
    px: { xs: 3, md: 4 },
    py: { xs: 1.5, md: 1.5 },
    minHeight: 48,
    fontSize: { xs: '0.875rem', md: '1rem' },
    minWidth: { xs: 'auto', sm: 120 },
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textTransform: 'none' as const,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
    transition: 'all 0.3s ease'
  },

  // Filter/Utility Button
  utilityButton: {
    borderRadius: 2,
    fontWeight: 600,
    px: { xs: 3, md: 3 },
    py: { xs: 1.5, md: 1.5 },
    minHeight: 48,
    fontSize: { xs: '0.875rem', md: '0.875rem' },
    minWidth: { xs: 'auto', sm: 100 },
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    textTransform: 'none' as const,
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.3s ease'
  },

  // Icon Button
  iconButton: {
    borderRadius: 2,
    minHeight: 48,
    minWidth: 48,
    '&:hover': {
      transform: 'scale(1.05)',
    },
    transition: 'all 0.3s ease'
  },

  // Responsive Button Container
  buttonContainer: {
    display: 'flex',
    gap: { xs: 2, md: 2 },
    width: { xs: '100%', md: 'auto' },
    flexDirection: { xs: 'column', sm: 'row' } as const,
    alignItems: 'stretch' as const
  },

  // Glassmorphism Button (for headers)
  glassmorphismButton: {
    borderRadius: 3,
    px: { xs: 3, md: 4 },
    py: { xs: 1.5, md: 1.5 },
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    fontWeight: 700,
    textTransform: 'none' as const,
    fontSize: { xs: '0.9rem', md: '1rem' },
    minWidth: { xs: 'auto', sm: 140 },
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.3)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    },
    transition: 'all 0.3s ease'
  }
};

// Card Styles
export const cardStyles = {
  // Enhanced Card with Gradient Background
  gradientCard: {
    borderRadius: 4,
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)',
    overflow: 'hidden',
    position: 'relative' as const,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
    },
    transition: 'all 0.3s ease'
  },

  // Header Card
  headerCard: {
    mb: 4,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 4,
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden'
  },

  // Statistics Card
  statsCard: {
    textAlign: 'center' as const,
    p: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 3,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    },
    transition: 'all 0.3s ease'
  }
};

// Typography Styles
export const typographyStyles = {
  // Page Title
  pageTitle: {
    fontWeight: 800,
    color: 'text.primary',
    mb: 0.5,
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
    lineHeight: 1.2
  },

  // Page Subtitle
  pageSubtitle: {
    fontWeight: 400,
    fontSize: { xs: '0.9rem', md: '1.25rem' },
    lineHeight: 1.3
  },

  // Section Title
  sectionTitle: {
    fontWeight: 700,
    mb: 3,
    color: 'text.primary',
    fontSize: { xs: '1.2rem', md: '1.5rem' }
  },

  // Card Title
  cardTitle: {
    fontWeight: 600,
    fontSize: { xs: '1rem', md: '1.25rem' }
  }
};

// Layout Styles
export const layoutStyles = {
  // Page Container
  pageContainer: {
    mt: 4,
    mb: 4,
    flex: 1,
    overflow: 'auto'
  },

  // Section Container
  sectionContainer: {
    mb: 4,
    p: 4
  },

  // Responsive Grid
  responsiveGrid: {
    container: true,
    spacing: { xs: 2, md: 3 }
  }
};

// Animation Styles
export const animationStyles = {
  // Hover Scale
  hoverScale: {
    '&:hover': {
      transform: 'scale(1.02)',
    },
    transition: 'all 0.3s ease'
  },

  // Hover Lift
  hoverLift: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
    transition: 'all 0.3s ease'
  },

  // Fade In
  fadeIn: {
    opacity: 0,
    animation: 'fadeIn 0.5s ease-in-out forwards'
  }
};

// Responsive Text Styles
export const responsiveTextStyles = {
  // Responsive Button Text
  responsiveButtonText: (fullText: string, shortText: string) => ({
    fullText: {
      display: { xs: 'none', sm: 'inline' }
    },
    shortText: {
      display: { xs: 'inline', sm: 'none' }
    }
  })
};

export default {
  buttonStyles,
  cardStyles,
  typographyStyles,
  layoutStyles,
  animationStyles,
  responsiveTextStyles
}; 