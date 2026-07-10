import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button, buttonClassName } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { paths } from '@/routes/paths';

export function Navbar() {
  const { mode, toggleMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Link to={paths.landing} className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">AI</span>
          <span>AI Study Coach</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <NavLink
            to={paths.login}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Login
          </NavLink>
          <Link to={paths.signup} className={buttonClassName({ variant: 'primary', size: 'md' })}>
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
