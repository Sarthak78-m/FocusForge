import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/40',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 h-10 w-10 rounded-full bg-[var(--color-card-hover)] flex items-center justify-center text-[var(--color-text-tertiary)]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
