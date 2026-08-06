import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-200 dark:bg-[var(--color-surface)] dark:border-[var(--color-border)]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h2 className={cn('text-base font-semibold text-text-primary dark:text-[var(--color-text-primary)]', className)} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ className, children, ...props }: CardProps) {
  return (
    <p className={cn('mt-1 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]', className)} {...props}>
      {children}
    </p>
  );
}
