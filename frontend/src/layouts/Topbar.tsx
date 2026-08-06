import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, Timer, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { appNavigation } from '@/routes/navigation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

export function Topbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { mode, toggleMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md dark:bg-[var(--color-surface)]/90">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: mobile hamburger + page label */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary hover:bg-primary-50 hover:text-[var(--color-text-primary)] transition-all duration-200 dark:text-[var(--color-text-secondary)] dark:hover:bg-primary-950 lg:hidden"
          >
            {isMobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500">
              <Timer className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
          </div>
        </div>

        {/* Right: user + actions */}
        <div className="flex items-center gap-1">
          {user && (
            <div className="mr-2 hidden text-right sm:block">
              <p className="text-xs font-medium text-[var(--color-text-primary)]">{user.name}</p>
              <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">{user.email}</p>
            </div>
          )}

          <button
            type="button"
            onClick={toggleMode}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 dark:text-[var(--color-text-secondary)] dark:hover:bg-primary-950 dark:hover:text-primary-300"
          >
            {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-text-secondary hover:bg-error-50 hover:text-error-600 transition-all duration-200 dark:text-[var(--color-text-secondary)] dark:hover:bg-error-950 dark:hover:text-error-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {isMobileNavOpen && (
        <nav
          className="border-t border-[var(--color-border)] bg-white px-3 pb-3 pt-2 dark:bg-[var(--color-surface)] lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="space-y-0.5">
            {appNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-primary-50/60 hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] dark:hover:bg-primary-950/60',
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-none" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
