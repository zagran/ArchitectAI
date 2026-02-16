import { forwardRef, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ 
    label, 
    error, 
    className, 
    required = false,
    disabled = false,
    rows = 4,
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
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={clsx(
            'form-field resize-none',
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

Textarea.displayName = 'Textarea';

export default Textarea;
