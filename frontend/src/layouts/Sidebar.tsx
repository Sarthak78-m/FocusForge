import { NavLink } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { appNavigation } from '@/routes/navigation';
import { cn } from '@/utils/cn';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950 lg:flex">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-stone-200 px-5 dark:border-stone-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <Timer className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold text-stone-900 dark:text-white">MindSprint</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Workspace">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-600">
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
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100',
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
      <div className="border-t border-stone-200 px-5 py-4 dark:border-stone-800">
        <p className="text-xs text-stone-400 dark:text-stone-600">MindSprint © {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
}
