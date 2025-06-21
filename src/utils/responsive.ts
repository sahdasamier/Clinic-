import { useTheme, useMediaQuery, Breakpoint } from '@mui/material';
import { useEffect, useState } from 'react';

// Device detection utilities
export const useDeviceDetection = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  
  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };
    
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    return () => window.removeEventListener('resize', checkTouch);
  }, []);
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    isTouchDevice,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
};

// Responsive breakpoint utilities
export const useBreakpoint = () => {
  const theme = useTheme();
  
  const breakpoints = {
    xs: useMediaQuery(theme.breakpoints.only('xs')),
    sm: useMediaQuery(theme.breakpoints.only('sm')),
    md: useMediaQuery(theme.breakpoints.only('md')),
    lg: useMediaQuery(theme.breakpoints.only('lg')),
    xl: useMediaQuery(theme.breakpoints.only('xl')),
  };
  
  const currentBreakpoint = Object.entries(breakpoints).find(([_, matches]) => matches)?.[0] as Breakpoint || 'xs';
  
  return {
    ...breakpoints,
    current: currentBreakpoint,
    isUp: (breakpoint: Breakpoint) => useMediaQuery(theme.breakpoints.up(breakpoint)),
    isDown: (breakpoint: Breakpoint) => useMediaQuery(theme.breakpoints.down(breakpoint)),
  };
};

// Responsive spacing utilities
export const getResponsiveSpacing = (
  xs: number = 1,
  sm: number = xs * 1.5,
  md: number = xs * 2,
  lg: number = xs * 2.5,
  xl: number = xs * 3
) => ({
  xs,
  sm,
  md,
  lg,
  xl,
});

// Responsive font size utilities
export const getResponsiveFontSize = (
  base: string = '1rem',
  scale: number = 1.2
) => ({
  xs: base,
  sm: `calc(${base} * ${scale * 0.9})`,
  md: `calc(${base} * ${scale})`,
  lg: `calc(${base} * ${scale * 1.1})`,
  xl: `calc(${base} * ${scale * 1.2})`,
});

// Safe area utilities for devices with notches
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  
  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
      });
    };
    
    // Set CSS custom properties for safe area insets
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --sat: env(safe-area-inset-top);
        --sar: env(safe-area-inset-right);
        --sab: env(safe-area-inset-bottom);
        --sal: env(safe-area-inset-left);
      }
    `;
    document.head.appendChild(style);
    
    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
      document.head.removeChild(style);
    };
  }, []);
  
  return safeArea;
};

// Responsive grid utilities
export const getResponsiveGridProps = (
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 3
) => {
  const { isMobile, isTablet } = useDeviceDetection();
  
  if (isMobile) return { xs: 12 / mobileColumns };
  if (isTablet) return { xs: 12, md: 12 / tabletColumns };
  return { xs: 12, md: 12 / tabletColumns, lg: 12 / desktopColumns };
};

// Touch target utilities
export const getTouchTargetSize = (size: 'small' | 'medium' | 'large' = 'medium') => {
  const sizes = {
    small: { minHeight: 40, minWidth: 40 },
    medium: { minHeight: 44, minWidth: 44 },
    large: { minHeight: 48, minWidth: 48 },
  };
  
  return sizes[size];
};

// Responsive modal utilities
export const getResponsiveModalProps = () => {
  const { isMobile } = useDeviceDetection();
  
  return {
    fullScreen: isMobile,
    maxWidth: isMobile ? false : 'md',
    PaperProps: {
      sx: {
        m: isMobile ? 0 : 2,
        width: isMobile ? '100%' : 'auto',
        height: isMobile ? '100%' : 'auto',
        borderRadius: isMobile ? 0 : 2,
      },
    },
  };
};

// Responsive table utilities
export const shouldUseCardView = (columnCount: number, threshold: number = 4) => {
  const { isMobile } = useDeviceDetection();
  return isMobile && columnCount > threshold;
};

// Orientation utilities
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  return orientation;
};

// Responsive container utilities
export const getResponsiveContainer = () => {
  const { isMobile, isTablet } = useDeviceDetection();
  
  return {
    maxWidth: isMobile ? '100%' : isTablet ? 'md' : 'lg',
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 2, sm: 3, md: 4 },
  };
};

// Export commonly used responsive values
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

export const TOUCH_TARGET_SIZES = {
  small: 40,
  medium: 44,
  large: 48,
} as const;

export const RESPONSIVE_SPACING = {
  xs: 1,
  sm: 1.5,
  md: 2,
  lg: 2.5,
  xl: 3,
} as const; 