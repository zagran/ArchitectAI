import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ButtonProps } from '@/types';

const Button = forwardRef<HTMLButtonElement, ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false, 
    onClick, 
    children, 
    className, 
    type = 'button',
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
      secondary: 'bg-white hover:bg-secondary-50 text-secondary-700 border border-secondary-300 shadow-sm focus:ring-primary-500',
      success: 'bg-success-600 hover:bg-success-700 text-white shadow-sm focus:ring-success-500',
      warning: 'bg-warning-600 hover:bg-warning-700 text-white shadow-sm focus:ring-warning-500',
      error: 'bg-error-600 hover:bg-error-700 text-white shadow-sm focus:ring-error-500',
      ghost: 'hover:bg-secondary-50 text-secondary-700 focus:ring-primary-500',
      link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500',
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <div className="spinner mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
