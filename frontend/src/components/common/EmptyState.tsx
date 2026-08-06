import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({ title, message, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-primary-300 bg-background p-8 text-center dark:border-primary-800 dark:bg-[var(--color-background)]">
      <Icon className="mx-auto h-10 w-10 text-primary-400" aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-text-primary dark:text-[var(--color-text-primary)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
