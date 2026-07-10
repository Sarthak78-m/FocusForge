import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/common';

type ModuleShellPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ModuleShellPage({ title, description, icon }: ModuleShellPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <EmptyState icon={icon} title={title} message={description} />
    </div>
  );
}
