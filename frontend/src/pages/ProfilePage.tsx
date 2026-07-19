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
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
        <Icon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-stone-900 dark:text-white">
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
        <h1 className="text-xl font-semibold text-stone-900 dark:text-white">Profile</h1>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
          Your account details and settings
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        {/* Avatar + name */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
                <div className="h-3 w-24 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                <span className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="text-base font-semibold text-stone-900 dark:text-white">
                  {user?.name ?? '—'}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{user?.email ?? '—'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
          <div className="px-6">
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              <ProfileField icon={User} label="Full name" value={user?.name} />
              <ProfileField icon={Mail} label="Email address" value={user?.email} />
              <ProfileField icon={Shield} label="Role" value={user?.role} />
              <ProfileField icon={Calendar} label="Member since" value={memberSince} />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
          <div className="border-b border-stone-100 px-6 py-4 dark:border-stone-800">
            <p className="text-sm font-semibold text-stone-900 dark:text-white">Preferences</p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                {mode === 'dark' ? (
                  <Moon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                ) : (
                  <Sun className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-white">Theme</p>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  {mode === 'dark' ? 'Dark mode' : mode === 'light' ? 'Light mode' : 'System default'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMode}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-900"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
          <div className="border-b border-stone-100 px-6 py-4 dark:border-stone-800">
            <p className="text-sm font-semibold text-stone-900 dark:text-white">Session</p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-white">Log out</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                End your session on this device
              </p>
            </div>
            <button
              type="button"
              onClick={() => clearSession()}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
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
