import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer';

    const variants = {
      primary:
        'bg-[#0B1220] text-white hover:bg-[#123047] active:bg-[#070D18] shadow-sm dark:bg-teal-500 dark:text-[#0B1220] dark:hover:bg-teal-400 dark:font-semibold',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 dark:bg-[#1E2E4A] dark:text-slate-200 dark:hover:bg-[#25395A]',
      outline:
        'border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#152238] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E2E4A] active:bg-slate-100',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#1E2E4A]',
    };

    const sizes = {
      sm: 'text-xs py-1.5 px-3 rounded-md min-h-[34px]',
      md: 'text-sm py-2 px-4 rounded-lg min-h-[38px]',
      lg: 'text-base py-2.5 px-5 rounded-lg min-h-[42px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
