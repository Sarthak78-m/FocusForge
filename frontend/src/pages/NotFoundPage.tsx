import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-background)] px-4">
      <p className="text-8xl font-bold tracking-tighter text-primary-200 dark:text-primary-950">404</p>
      <h1 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">Page not found</h1>
      <p className="mt-2 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={paths.landing}
        className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] shadow-soft transition-all duration-200 hover:bg-primary-50 dark:bg-[var(--color-surface)] dark:hover:bg-primary-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
