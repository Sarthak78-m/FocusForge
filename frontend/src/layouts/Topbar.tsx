import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { appNavigation } from '@/routes/navigation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

export function Topbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { mode, toggleMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
              {user?.name ?? 'Study workspace'}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email ?? 'Focus today'}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-1 md:flex lg:hidden" aria-label="Compact navigation">
          {appNavigation.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-blue-50 text-brand-700 dark:bg-blue-950 dark:text-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => clearSession()} aria-label="Logout">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {isMobileNavOpen ? (
        <nav
          className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="grid gap-1 sm:grid-cols-2">
            {appNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-blue-50 text-brand-700 dark:bg-blue-950 dark:text-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
