import { LogOut, Moon, Sun, User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentUser } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
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
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-primary-50/50 dark:bg-primary-950/30">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary dark:text-[var(--color-text-secondary)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
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
  const { mode, toggleMode } = useTheme();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Profile</h1>
        <p className="mt-0.5 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
          Your account details and settings
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        {/* Avatar + name */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-soft dark:bg-[var(--color-surface)]">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 animate-pulse rounded-full bg-primary-100 dark:bg-primary-900/40" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-primary-100 dark:bg-primary-900/40" />
                <div className="h-3 w-24 animate-pulse rounded bg-primary-50 dark:bg-primary-900/20" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 shadow-inner dark:bg-primary-950">
                <span className="text-xl font-semibold text-primary-700 dark:text-primary-300">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  {user?.name ?? '—'}
                </p>
                <p className="text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">{user?.email ?? '—'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-soft dark:bg-[var(--color-surface)]">
          <div className="px-6">
            <div className="divide-y divide-[var(--color-border)]">
              <ProfileField icon={User} label="Full name" value={user?.name} />
              <ProfileField icon={Mail} label="Email address" value={user?.email} />
              <ProfileField icon={Shield} label="Role" value={user?.role} />
              <ProfileField icon={Calendar} label="Member since" value={memberSince} />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-soft dark:bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Preferences</p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-[var(--color-border)] bg-primary-50/50 dark:bg-primary-950/30">
                {mode === 'dark' ? (
                  <Moon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                ) : (
                  <Sun className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Theme</p>
                <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
                  {mode === 'dark' ? 'Dark mode' : mode === 'light' ? 'Light mode' : 'System default'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMode}
              className="rounded-xl border border-[var(--color-border)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-primary-50 transition-all duration-200 dark:hover:bg-primary-950"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-soft dark:bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Session</p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Log out</p>
              <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
                End your session on this device
              </p>
            </div>
            <button
              type="button"
              onClick={() => clearSession()}
              className="flex items-center gap-1.5 rounded-xl border border-error-200 bg-error-50 px-3.5 py-1.5 text-xs font-medium text-error-700 transition-all duration-200 hover:bg-error-100 dark:border-error-900 dark:bg-error-950 dark:text-error-400 dark:hover:bg-error-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
