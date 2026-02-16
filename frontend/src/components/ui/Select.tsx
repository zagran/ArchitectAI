import { forwardRef, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import { SelectProps } from '@/types';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const Select = forwardRef<HTMLSelectElement, SelectProps & SelectHTMLAttributes<HTMLSelectElement>>(
  ({ 
    label, 
    error, 
    placeholder, 
    options, 
    className, 
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
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={clsx(
              'form-field appearance-none pr-10',
              error && 'form-field error',
              disabled && 'bg-secondary-50 text-secondary-500 cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-secondary-400" />
          </div>
        </div>
        {error && (
          <p className="form-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
