import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({ className, label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300', className)}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
