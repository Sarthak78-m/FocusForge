import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      <p className="text-7xl font-semibold text-stone-200 dark:text-stone-800">404</p>
      <h1 className="mt-4 text-xl font-semibold text-stone-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={paths.landing}
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
