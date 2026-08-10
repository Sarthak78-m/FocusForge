import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  const { activePalette } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 font-sans text-center">
      <div className="relative flex items-center justify-center">
        <p
          className="text-9xl font-black tracking-tighter text-transparent bg-clip-text opacity-90 select-none"
          style={{ backgroundImage: activePalette.gradient }}
        >
          404
        </p>
      </div>

      <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
        Lost in Space? Page Not Found
      </h1>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
        The page you are looking for doesn't exist or may have been relocated. Let's get you back on track with your study goals.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to={paths.dashboard}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
          style={{ background: activePalette.gradient }}
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <Link
          to={paths.landing}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

