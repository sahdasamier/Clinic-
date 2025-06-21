import tailwindcssRtl from 'tailwindcss-rtl';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'mobile': { 'max': '767px' },
      'tablet': { 'min': '768px', 'max': '1023px' },
      'desktop': { 'min': '1024px' },
      'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
      'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
    },
    extend: {
      colors: {
        'primary': '#1D3557',
        'secondary': '#457B9D',
        'accent': '#E63946',
        'background': '#F1FAEE',
        'mobile-primary': '#1D3557',
        'tablet-primary': '#457B9D',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'touch': '44px',
        'touch-sm': '40px',
        'touch-lg': '48px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        'mobile': '100%',
        'tablet': '768px',
        'desktop': '1200px',
      },
      minHeight: {
        'touch': '44px',
        'touch-sm': '40px',
        'touch-lg': '48px',
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minWidth: {
        'touch': '44px',
        'touch-sm': '40px',
        'touch-lg': '48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'loading': 'loading 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'touch': '8px',
        'touch-sm': '6px',
        'touch-lg': '12px',
      },
      boxShadow: {
        'touch': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'touch-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'mobile': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'tablet': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'desktop': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        'touch': ['16px', '24px'],
        'touch-sm': ['14px', '20px'],
        'touch-lg': ['18px', '28px'],
      },
      zIndex: {
        'modal': '1300',
        'drawer': '1200',
        'header': '1100',
        'overlay': '1000',
        'fab': '1050',
      },
    },
  },
  plugins: [
    tailwindcssRtl,
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.touch-target-sm': {
          'min-height': '40px',
          'min-width': '40px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.touch-target-lg': {
          'min-height': '48px',
          'min-width': '48px',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.safe-area': {
          'padding-top': 'max(env(safe-area-inset-top), 1rem)',
          'padding-right': 'max(env(safe-area-inset-right), 1rem)',
          'padding-bottom': 'max(env(safe-area-inset-bottom), 1rem)',
          'padding-left': 'max(env(safe-area-inset-left), 1rem)',
        },
        '.safe-area-t': {
          'padding-top': 'max(env(safe-area-inset-top), 1rem)',
        },
        '.safe-area-b': {
          'padding-bottom': 'max(env(safe-area-inset-bottom), 1rem)',
        },
        '.safe-area-l': {
          'padding-left': 'max(env(safe-area-inset-left), 1rem)',
        },
        '.safe-area-r': {
          'padding-right': 'max(env(safe-area-inset-right), 1rem)',
        },
        '.text-responsive': {
          'font-size': 'clamp(0.875rem, 2.5vw, 1.125rem)',
          'line-height': '1.5',
        },
        '.text-responsive-sm': {
          'font-size': 'clamp(0.75rem, 2vw, 0.875rem)',
          'line-height': '1.4',
        },
        '.text-responsive-lg': {
          'font-size': 'clamp(1rem, 3vw, 1.5rem)',
          'line-height': '1.6',
        },
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.no-zoom': {
          'font-size': '16px',
          'transform-origin': 'left top',
        },
        '.focus-ring': {
          'outline': '2px solid transparent',
          'outline-offset': '2px',
          '&:focus-visible': {
            'outline': '2px solid #3b82f6',
            'outline-offset': '2px',
          },
        },
      }
      
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
} 