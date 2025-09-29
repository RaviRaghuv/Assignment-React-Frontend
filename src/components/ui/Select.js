import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={clsx(
          'block w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none hover:border-gray-300',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-100',
          className
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
