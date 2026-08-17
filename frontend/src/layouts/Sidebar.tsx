import { NavLink } from 'react-router-dom';
import { Plus, Hash } from 'lucide-react';
import { appNavigation } from '@/routes/navigation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';

const WORKSPACE_PROJECTS = [
  { name: 'ExamPrep', count: 5, color: '#E44332' },
  { name: 'Fitness', count: 3, color: '#006B1D' },
  { name: 'Appointments', count: 2, color: '#0058BF' },
  { name: 'WebsiteUpdate', count: 4, color: '#FF7A00' },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'F';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] p-4 dark:bg-[var(--color-surface)] lg:flex">
      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-6 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--color-border)] shadow-xs">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-white text-sm">
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-[var(--color-text-primary)]">
            {user?.name || 'FocusForge User'}
          </h2>
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">Focusing since 2026</p>
        </div>
      </div>

      {/* Quick Add Task Button (Stitch Red Pill) */}
      <button
        type="button"
        onClick={() => {
          const event = new CustomEvent('open-quick-add-modal');
          window.dispatchEvent(event);
        }}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[var(--color-primary-hover)] hover:scale-[1.02] active:scale-98"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </button>

      {/* Main Navigation Drawer Links */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1" aria-label="Workspace">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Core Modules
          </p>
          <div className="space-y-1">
            {appNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-text-primary)] dark:hover:bg-slate-900',
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-none" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Projects / Hashtags Section (Stitch Design System) */}
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            My Projects
          </p>
          <div className="space-y-1">
            {WORKSPACE_PROJECTS.map((proj) => (
              <div
                key={proj.name}
                className="flex items-center justify-between rounded-full px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-text-primary)] transition-all cursor-pointer dark:hover:bg-slate-900"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: proj.color }}
                  />
                  <span className="flex items-center gap-0.5">
                    <Hash className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                    {proj.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {proj.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] pt-3 text-center">
        <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">
          FocusForge Pro © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
