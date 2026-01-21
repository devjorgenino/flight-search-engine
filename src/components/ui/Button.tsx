'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-150 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
        'hover:from-emerald-600 hover:to-emerald-700',
        'dark:from-emerald-400 dark:to-emerald-500 dark:hover:from-emerald-500 dark:hover:to-emerald-600',
        'shadow-md hover:shadow-lg',
        'border border-transparent'
      ),
      secondary: cn(
        'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-900',
        'hover:from-neutral-200 hover:to-neutral-300',
        'dark:from-neutral-800 dark:to-neutral-700 dark:text-neutral-100 dark:hover:from-neutral-700 dark:hover:to-neutral-600',
        'border border-neutral-200 dark:border-neutral-600'
      ),
      ghost: cn(
        'text-neutral-600 dark:text-neutral-400',
        'hover:bg-neutral-100 hover:text-neutral-900',
        'dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
      ),
      outline: cn(
        'border-2 border-neutral-200 text-neutral-700 bg-transparent',
        'hover:border-neutral-300 hover:bg-neutral-50',
        'dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
      ),
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        aria-disabled={disabled || isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
