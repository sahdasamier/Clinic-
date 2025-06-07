import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outline' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ variant = 'filled', children, ...props }) => {
  const baseClasses = 'px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    filled: 'text-white bg-primary hover:bg-secondary focus:ring-primary',
    outline: 'text-primary border border-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-gray-100 focus:ring-primary',
  };

  return (
    <button {...props} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};

export default Button; 