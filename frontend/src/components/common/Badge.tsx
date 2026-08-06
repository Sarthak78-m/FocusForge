import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeTone = 'primary' | 'secondary' | 'accent' | 'blue' | 'green' | 'amber' | 'red' | 'slate';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  primary:
    'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-950 dark:text-primary-200 dark:ring-primary-900',
  secondary:
    'bg-secondary-50 text-secondary-700 ring-secondary-200 dark:bg-secondary-950 dark:text-secondary-200 dark:ring-secondary-900',
  accent:
    'bg-accent-50 text-accent-700 ring-accent-200 dark:bg-accent-950 dark:text-accent-200 dark:ring-accent-900',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-900',
  green:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900',
  amber:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900',
  red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-900',
  slate:
    'bg-primary-50 text-text-primary ring-primary-200 dark:bg-primary-950 dark:text-[var(--color-text-primary)] dark:ring-primary-800',
};

export function Badge({ className, tone = 'slate', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1', tones[tone], className)}
      {...props}
    />
  );
}
