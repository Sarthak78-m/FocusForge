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
          <label htmlFor={inputId} className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            'h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 transition-colors',
            'placeholder:text-slate-400 hover:border-slate-300',
            'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600',
            error ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200',
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
