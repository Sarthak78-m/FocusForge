import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';

type ModuleShellPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ModuleShellPage({ title, description, icon: Icon }: ModuleShellPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
        <p className="mt-0.5 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-24 text-center shadow-soft dark:bg-[var(--color-surface)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-950 dark:text-primary-400">
          <Icon className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
          {title} — Coming soon
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
          <Construction className="h-3.5 w-3.5 text-secondary-500" />
          This feature is under development
        </p>
      </div>
    </div>
  );
}
