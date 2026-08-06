import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun, Timer } from 'lucide-react';
import { Button, buttonClassName } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { paths } from '@/routes/paths';

export function Navbar() {
  const { mode, toggleMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md dark:bg-[var(--color-surface)]/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Link to={paths.landing} className="flex items-center gap-2.5 font-semibold text-[var(--color-text-primary)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
            <Timer className="h-4 w-4" />
          </span>
          <span>MindSprint</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <NavLink
            to={paths.login}
            className="rounded-xl px-3.5 py-2 text-sm font-medium text-text-secondary hover:bg-primary-50 hover:text-[var(--color-text-primary)] transition-all duration-200 dark:hover:bg-primary-950"
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
