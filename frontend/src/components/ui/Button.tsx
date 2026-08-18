import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] border border-transparent shadow-sm',
  secondary:
    'bg-[var(--color-card)] text-[var(--color-text)] hover:bg-[var(--color-card-hover)] border border-[var(--color-border)]',
  ghost:
    'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-card-hover)] border border-transparent',
  danger:
    'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'secondary', size = 'md', iconLeft, iconRight, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...rest}
      >
        {iconLeft}
        {children}
        {iconRight}
      </button>
    );
  },
);
Button.displayName = 'Button';
