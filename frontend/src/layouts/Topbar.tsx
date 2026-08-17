import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Timer,
  User,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth.store';
import { usePomodoro } from '@/hooks/usePomodoro';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { ThemeCustomizer } from '@/components/common/ThemeCustomizer';

const NAV_ITEMS = [
  { label: 'Dashboard', path: paths.dashboard,  icon: LayoutDashboard, end: true },
  { label: 'Tasks',     path: paths.tasks,       icon: CheckSquare,     end: false },
  { label: 'Pomodoro',  path: paths.pomodoro,    icon: Timer,           end: false },
  { label: 'Profile',   path: paths.profile,     icon: User,            end: false },
] as const;

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activePalette } = useTheme();
  const { isRunning, display } = usePomodoro();
  const user  = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const firstName   = user?.name ? user.name.split(' ')[0] : 'User';

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* ── Main nav bar ── */}
      <header
        className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl"
        style={{ boxShadow: 'var(--shadow-nav)', height: '64px' }}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-6">

          {/* ── Left: Logo ── */}
          <div className="flex flex-none items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs"
              style={{ background: activePalette.gradient }}
              aria-hidden="true"
            >
              <Timer className="h-4.5 w-4.5 text-white" />
            </div>
            <span
              className="text-base font-extrabold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              FocusForge
            </span>
          </div>

          {/* ── Center: Dynamic Nav pills (desktop) ── */}
          <nav
            className="hidden md:flex items-center gap-1 rounded-full px-1.5 py-1.5"
            style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-border)' }}
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 select-none',
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: activePalette.gradient,
                          boxShadow: `0 2px 8px ${activePalette.glow}`,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex flex-none items-center gap-1.5">
            {isRunning && (
              <NavLink
                to={paths.pomodoro}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs animate-pulse"
                style={{ background: activePalette.gradient }}
                title="Active Pomodoro Focus Sprint"
              >
                <Timer className="h-3.5 w-3.5" />
                <span>{display}</span>
              </NavLink>
            )}

            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Live Theme customizer */}
            <ThemeCustomizer />

            {/* Divider */}
            <div
              className="mx-1 h-5 w-px"
              style={{ background: 'var(--color-border)' }}
              aria-hidden="true"
            />

            {/* User avatar + name */}
            <div className="hidden sm:flex items-center gap-2.5 mr-0.5">
              <div
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-semibold text-white select-none"
                style={{ background: activePalette.gradient }}
                aria-hidden="true"
              >
                {userInitial}
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {firstName}
              </span>
            </div>

            {/* Settings */}
            <button
              type="button"
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Logout */}
            <button
              type="button"
              aria-label="Log out"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 dark:hover:bg-rose-950"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile menu hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150 md:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
