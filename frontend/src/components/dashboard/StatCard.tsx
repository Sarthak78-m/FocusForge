import { Card } from '../ui/Card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type StatColor = 'violet' | 'emerald' | 'sky' | 'amber' | 'rose';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  color?: StatColor;
  trend?: { value: number; positive: boolean };
}

const COLOR_STYLES: Record<StatColor, { bg: string; icon: string }> = {
  violet: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/50',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    icon: 'text-rose-600 dark:text-rose-400',
  },
};

export function StatCard({ label, value, hint, icon: Icon, color = 'violet', trend }: Props) {
  const styles = COLOR_STYLES[color];

  return (
    <Card className="p-4.5 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all bg-[var(--color-card)] shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--color-text-secondary)] font-medium">
            {label}
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[var(--color-text)] tracking-tight">
            {value}
          </div>
          {hint && (
            <div className="mt-0.5 text-2xs text-[var(--color-text-tertiary)]">
              {hint}
            </div>
          )}
        </div>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
          <Icon className={cn("h-4.5 w-4.5", styles.icon)} />
        </div>
      </div>
      {trend && (
        <div className="mt-2.5 text-2xs font-medium flex items-center gap-1">
          <span className={trend.positive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-[var(--color-text-tertiary)]">vs last week</span>
        </div>
      )}
    </Card>
  );
}


