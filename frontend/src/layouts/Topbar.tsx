import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Flame,
  Timer,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useAppStore } from '@/store/appStore';
import { paths } from '@/routes/paths';
import { ThemeCustomizer } from '@/components/common/ThemeCustomizer';

export function Topbar() {
  const { isRunning, display } = usePomodoro();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const toggleLeftSidebar = useAppStore((s) => s.toggleLeftSidebar);
  const leftSidebarOpen = useAppStore((s) => s.leftSidebarOpen);
  const navigate = useNavigate();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';


  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
      style={{ height: '46px' }}
    >
      <div className="flex h-full w-full items-center justify-between px-3 gap-3">
        {/* Left Section: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-2 flex-none">
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title={leftSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <NavLink
            to={paths.dashboard}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="FocusForge Home"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-primary)] text-white font-bold text-xs shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--color-text-primary)] hidden sm:inline">
              FocusForge
            </span>
          </NavLink>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-sm mx-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-tertiary)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search (Ctrl+K)"
              className="w-full h-7 pl-8 pr-3 rounded-md bg-[var(--color-surface-secondary)] border border-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-strong)] transition-all"
            />
          </div>
        </div>

        {/* Right Section: Quick Actions & Profile */}
        <div className="flex items-center gap-1.5 flex-none">
          {/* Active Pomodoro indicator */}
          {isRunning && (
            <NavLink
              to={paths.pomodoro}
              className="flex items-center gap-1 px-2 h-7 rounded-md text-xs font-semibold bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-container)] transition-colors"
              title="Active Focus Session"
            >
              <Timer className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span>{display}</span>
            </NavLink>
          )}


          {/* Productivity Karma / Streak */}
          <NavLink
            to={paths.analytics}
            className="hidden sm:flex items-center gap-1 px-2 h-7 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Daily Study Streak"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Streak</span>
          </NavLink>

          {/* Theme Customizer */}
          <ThemeCustomizer />

          {/* User Profile Avatar & Logout */}
          <div className="flex items-center gap-1 ml-1 border-l border-[var(--color-border)] pl-2">
            <NavLink
              to={paths.profile}
              className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-xs font-bold bg-[var(--color-primary)] text-white shadow-xs hover:opacity-90"
              title={`${firstName} (${user?.email || 'Profile'})`}
            >
              {userInitial}
            </NavLink>


            <button
              type="button"
              onClick={handleLogout}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

}


