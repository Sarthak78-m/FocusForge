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
        <h1 className="text-xl font-semibold text-stone-900 dark:text-white">{title}</h1>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
          <Icon className="h-6 w-6 text-stone-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-stone-700 dark:text-stone-300">
          {title} — Coming soon
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
          <Construction className="h-3.5 w-3.5" />
          This feature is under development
        </p>
      </div>
    </div>
  );
}
