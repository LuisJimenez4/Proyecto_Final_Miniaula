import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/** Lista desplegable con etiqueta y error bajo el campo. `options` son strings o `{ value, label }`. */
export const Select = forwardRef(({ label, name, options = [], placeholder, error, className = '', ...props }, ref) => {
  const id = `field-${name}`;
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <select
          id={id}
          name={name}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full appearance-none rounded-lg border px-3.5 py-2 pr-9 text-sm text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 min-h-[44px] sm:min-h-0 ${
            error ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
          }`}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const { value, label: text } = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
