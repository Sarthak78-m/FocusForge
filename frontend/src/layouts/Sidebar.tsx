import { NavLink } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { appNavigation } from '@/routes/navigation';
import { cn } from '@/utils/cn';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] lg:flex">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--color-border)] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 shadow-sm">
          <Timer className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">FocusForge</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Workspace">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-secondary dark:text-[var(--color-text-secondary)]">
          Workspace
        </p>
        <div className="space-y-0.5">
          {appNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950 dark:text-primary-300'
                    : 'text-text-secondary hover:bg-primary-50/60 hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)] dark:hover:bg-primary-950/60 dark:hover:text-[var(--color-text-primary)]',
                )
              }
            >
              <item.icon className="h-4 w-4 flex-none" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">FocusForge © {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
}
