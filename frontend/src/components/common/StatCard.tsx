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
    <div className={cn('surface rounded-lg p-5', className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-brand-600 dark:bg-blue-950 dark:text-blue-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {trend ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{trend}</p> : null}
    </div>
  );
}
