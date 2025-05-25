import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    // Base styling for the input
    const baseInputClasses = `
      block w-full rounded-md border-gray-300 shadow-sm 
      focus:border-teal-500 focus:ring-teal-500 
      sm:text-sm transition-colors duration-150 ease-in-out
    `;

    // Error styling for the input
    // This will override parts of baseInputClasses related to border and focus ring when error is present.
    const errorInputClasses = error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500';
      // Re-specify non-error focus to ensure it's applied when no error

    // Combine classes: Start with base, then error-specific overrides, then custom className
    // Need to be careful with class order if overriding.
    // A simpler way for border/focus is to conditionally apply the full set.
    
    // Let's refine class combination for clarity:
    let combinedInputClasses = `
      block w-full rounded-md shadow-sm sm:text-sm 
      transition-colors duration-150 ease-in-out 
      ${className}
    `;

    if (error) {
      combinedInputClasses += ' border-red-500 focus:ring-red-500 focus:border-red-500';
    } else {
      combinedInputClasses += ' border-gray-300 focus:border-teal-500 focus:ring-teal-500';
    }
    
    const containerWidthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`${containerWidthClass}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={combinedInputClasses.trim().replace(/\s+/g, ' ')} // Normalize whitespace
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p> // Updated error text color
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;