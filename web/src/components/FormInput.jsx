import React, { forwardRef } from 'react';

export const FormInput = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      error,
      helperText,
      placeholder = '',
      className = '',
      as = 'input',
      children,
      ...props
    },
    ref
  ) => {
    const inputId = `field-${name}`;
    const Component = as;

    const baseClasses =
      'w-full rounded-lg border px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 shadow-sm';
    const stateClasses = error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white';

    return (
      <div className={`flex flex-col space-y-1.5 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}

        <Component
          id={inputId}
          name={name}
          type={type}
          ref={ref}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`${baseClasses} ${stateClasses}`}
          {...props}
        >
          {children}
        </Component>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
