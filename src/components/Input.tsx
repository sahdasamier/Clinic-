import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error,
  helperText,
  fullWidth = false,
  variant = 'outlined',
  startIcon,
  endIcon,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseInputClasses = `
    w-full px-3 py-2.5 sm:py-2 
    border rounded-lg 
    text-base sm:text-sm
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    placeholder:text-gray-400
    min-h-[44px] sm:min-h-[40px]
    ${startIcon ? 'pl-10 sm:pl-9' : ''}
    ${endIcon ? 'pr-10 sm:pr-9' : ''}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}
    ${variant === 'filled' ? 'bg-gray-50 border-0 focus:bg-white' : 'bg-white'}
    ${fullWidth ? 'w-full' : ''}
  `;

  const labelClasses = `
    block text-sm font-medium mb-1.5
    transition-colors duration-200
    ${error ? 'text-red-600' : isFocused ? 'text-primary' : 'text-gray-700'}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      <label 
        htmlFor={props.id || props.name} 
        className={labelClasses}
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Input Container */}
      <div className="relative">
        {/* Start Icon */}
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5">
              {startIcon}
            </div>
          </div>
        )}
        
        {/* Input */}
        <input
          {...props}
          className={baseInputClasses}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={{
            fontSize: '16px', // Prevents zoom on iOS
            WebkitAppearance: 'none',
            ...props.style
          }}
        />
        
        {/* End Icon */}
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 