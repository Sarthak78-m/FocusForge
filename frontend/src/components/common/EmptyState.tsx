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
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <Icon className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
