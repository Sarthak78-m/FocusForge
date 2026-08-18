import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-xs active:scale-98 disabled:opacity-50',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text-primary)]',
  ghost:
    'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] dark:text-[var(--color-text-primary)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};


const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-10 w-10 p-0',
};

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
    'disabled:cursor-not-allowed disabled:opacity-80',
    variants[variant],
    sizes[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonClassName({ variant, size, className })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
