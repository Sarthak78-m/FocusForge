import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-900 dark:border-error-900 dark:bg-error-950 dark:text-error-100">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm opacity-85">{message}</p>
          {onRetry ? (
            <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
