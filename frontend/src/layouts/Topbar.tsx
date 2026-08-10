import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
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
  const { mode, toggleMode } = useTheme();
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
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}
              aria-hidden="true"
            >
              <Timer className="h-4.5 w-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
            >
              MindSprint
            </span>
          </div>

          {/* ── Center: Nav pills (desktop) ── */}
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
                    'relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 select-none',
                    isActive
                      ? 'text-white'
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
                          background: 'var(--color-secondary)',
                          boxShadow: '0 2px 8px rgba(52,120,246,0.30)',
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
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white bg-indigo-600 animate-pulse shadow-md hover:scale-105 transition-all"
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

            {/* Theme customizer */}
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
                style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}
                aria-hidden="true"
              >
                {userInitial}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
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
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-danger-light hover:text-danger transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Hamburger (mobile) */}
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

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="sticky top-16 z-30 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 pb-4 pt-3 md:hidden"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          >
            <nav className="space-y-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[var(--color-secondary)] text-white'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
                    )
                  }
                >
                  <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile user row */}
            {user && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-2.5">
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}
                >
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {user.name}
                  </p>
                  <p className="truncate text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:text-danger transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-safe pt-2 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))', boxShadow: '0 -1px 3px rgba(0,0,0,0.06)' }}
        aria-label="Bottom navigation"
      >
        {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all duration-150',
                isActive
                  ? 'text-[var(--color-secondary)]'
                  : 'text-[var(--color-text-tertiary)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-5 w-5"
                  style={{ strokeWidth: isActive ? 2.5 : 1.75 }}
                  aria-hidden="true"
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
