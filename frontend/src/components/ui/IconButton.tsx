import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'filled' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  label: string;
}

const variants = {
  default:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)]',
  filled:
    'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)] border border-[var(--color-border)]',
  accent:
    'bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white',
};

const sizes = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'default', size = 'md', label, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-colors duration-150',
          variants[variant],
          sizes[size],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
