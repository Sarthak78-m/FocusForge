import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'accent' | 'muted' | 'outline';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: 'bg-[var(--color-card-hover)] text-[var(--color-text-secondary)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  muted: 'bg-transparent text-[var(--color-text-tertiary)]',
  outline:
    'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)]',
};

export function Badge({ className, variant = 'default', ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 h-5 rounded text-xs font-medium',
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
