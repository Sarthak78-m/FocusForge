import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-5 shadow-soft transition-all duration-200 dark:bg-[var(--color-surface)] dark:border-[var(--color-border)]', className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary dark:text-[var(--color-text-primary)]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-950 dark:text-primary-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {trend ? <p className="mt-4 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">{trend}</p> : null}
    </div>
  );
}
