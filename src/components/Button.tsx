import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'filled', 
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  children, 
  ...props 
}) => {
  const baseClasses = `
    relative font-medium rounded-lg transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform active:scale-95
    flex items-center justify-center gap-2
    min-h-[44px] min-w-[44px]
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
  `;

  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[40px] sm:min-h-[36px]',
    medium: 'px-4 py-2.5 text-base min-h-[44px] sm:min-h-[40px]',
    large: 'px-6 py-3 text-lg min-h-[48px] sm:min-h-[44px]',
  };

  const variantClasses = {
    filled: 'text-white bg-primary hover:bg-secondary focus:ring-primary shadow-sm hover:shadow-md',
    outline: 'text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary bg-transparent',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary/20 bg-transparent',
  };

  const responsiveClasses = `
    text-sm sm:text-base
    px-3 py-2 sm:px-4 sm:py-2.5
    rounded-md sm:rounded-lg
    hover:transform hover:scale-105
    active:transform active:scale-95
    transition-all duration-150 ease-in-out
    touch-manipulation
  `;

  return (
    <button 
      {...props} 
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${responsiveClasses}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        ...props.style
      }}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 