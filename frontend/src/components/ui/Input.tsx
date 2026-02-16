import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { InputProps } from '@/types';

const Input = forwardRef<HTMLInputElement, InputProps & InputHTMLAttributes<HTMLInputElement>>(
  ({ 
    label, 
    error, 
    className, 
    type = 'text',
    required = false,
    disabled = false,
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={clsx(
            'form-field',
            error && 'form-field error',
            disabled && 'bg-secondary-50 text-secondary-500 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p className="form-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
