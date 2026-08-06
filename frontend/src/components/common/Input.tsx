import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, error, ...props }, ref) => {
    const inputId = id ?? props.name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-2">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary dark:text-[var(--color-text-primary)]">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            'h-11 w-full rounded-xl border bg-white px-3 text-sm text-text-primary transition-all duration-200',
            'placeholder:text-text-secondary hover:border-primary-300',
            'dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)] dark:hover:border-primary-700',
            error ? 'border-error-500 focus-visible:ring-error-500' : 'border-border focus-visible:ring-secondary-400',
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
