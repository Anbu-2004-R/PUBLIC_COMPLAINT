import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, id, className = '', rows = 4, ...props }, ref) => {
    const areaId = id || props.name || Math.random().toString(36).substring(2, 9);
    const errorId = `${areaId}-error`;
    const hintId = `${areaId}-hint`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={areaId} className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label}
            {required && <span className="text-rose-600 dark:text-rose-400 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-lg border bg-white dark:bg-[#121E33] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F1F5F9] placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 dark:focus:border-teal-400 disabled:bg-slate-50 dark:disabled:bg-[#0E1726] disabled:text-slate-500 ${
            error
              ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-300 dark:border-[#29384D]'
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-[13px] text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-[13px] font-medium text-rose-600 dark:text-rose-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
