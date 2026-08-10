import { LogOut, Moon, Sun, User, Mail, Shield, Calendar, Palette, Flame, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentUser } from '@/hooks/useAuth';
import { useTheme, ACCENT_PALETTES } from '@/hooks/useTheme';
import { type ThemeAccent } from '@/store/theme.store';
import { cn } from '@/utils/cn';

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-[var(--color-primary)] dark:border-slate-800 dark:bg-slate-900">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const { isLoading } = useCurrentUser();
  const { mode, accent, setMode, setAccent, activePalette } = useTheme();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account & Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your personal profile, study preferences, and color themes
        </p>
      </div>

      <div className="mx-auto max-w-xl space-y-5">
        {/* Avatar + Name Header Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white shadow-md"
                  style={{ background: activePalette.gradient }}
                >
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {user?.name ?? 'Student'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">{user?.email ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                7-Day Streak
              </div>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Personal Details
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <ProfileField icon={User} label="Full Name" value={user?.name} />
            <ProfileField icon={Mail} label="Email Address" value={user?.email} />
            <ProfileField icon={Shield} label="Account Role" value={user?.role} />
            <ProfileField icon={Calendar} label="Member Since" value={memberSince} />
          </div>
        </div>

        {/* Theme & Color Preferences */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[var(--color-primary)]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Workspace Aesthetics
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{activePalette.label}</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Appearance Mode</span>
            <div className="flex gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setMode('light')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  mode === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                )}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setMode('dark')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  mode === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'
                )}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <span className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Accent Color Palette
            </span>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(ACCENT_PALETTES) as ThemeAccent[]).map((key) => {
                const palette = ACCENT_PALETTES[key];
                const isSelected = accent === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAccent(key)}
                    className={`h-10 w-full rounded-2xl transition-transform hover:scale-105 ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900' : ''
                    }`}
                    style={{ background: palette.gradient }}
                    title={palette.label}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Logout */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Active Session</p>
            <p className="text-xs text-slate-500">Log out of your study workspace on this browser</p>
          </div>
          <button
            type="button"
            onClick={() => clearSession()}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
