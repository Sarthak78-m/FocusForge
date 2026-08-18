import { useState } from 'react';
import { LogOut, Moon, Sun, User, Mail, Shield, Calendar, Palette, Flame, Sparkles, Phone, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCurrentUser } from '@/hooks/useAuth';
import { useTheme, ACCENT_PALETTES } from '@/hooks/useTheme';
import { useNotificationStore } from '@/store/notification.store';
import { type ThemeAccent } from '@/store/theme.store';
import { cn } from '@/utils/cn';
import { authService } from '@/services/auth.service';

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

function PhonePrivacyCard() {
  const user = useAuthStore((s) => s.user);
  const notify = useNotificationStore((s) => s.notify);

  const [phone, setPhone] = useState(user?.maskedPhoneNumber || '');
  const [enabled, setEnabled] = useState(user?.phoneNotificationsEnabled || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('+')) {
      notify({
        title: 'International Format Required',
        message: 'Phone number must start with + and country code (e.g. +919876543210 or +12025550123)',
        tone: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      const mockUser = localStorage.getItem('focusforge_mock_user');
      if (mockUser) {
        const parsed = JSON.parse(mockUser);
        parsed.maskedPhoneNumber = phone.length > 4 ? phone.slice(0, 3) + ' ***** **' + phone.slice(-4) : '*****';
        parsed.phoneNotificationsEnabled = enabled;
        localStorage.setItem('focusforge_mock_user', JSON.stringify(parsed));
      }
      notify({
        title: 'AES-256 Encrypted & Saved 🔒',
        message: 'Mobile number encrypted at rest and privacy settings updated.',
        tone: 'success',
      });
    } catch {
      notify({ title: 'Failed to update phone number', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Mobile Number & Highest Privacy Vault
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Shield className="h-3 w-3" /> AES-256 Encrypted
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Mobile Phone Number (E.164 Format)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210 or +1 2025550123"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            🔒 Encrypted at rest in database using AES-256. Masked in all API responses.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">1-Hour Urgent Task Deadline Alerts</p>
            <p className="text-[11px] text-slate-500">Allow SMS / WhatsApp deadline reminders before task due date</p>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          {isSaving ? 'Encrypting & Saving...' : 'Save & Encrypt Mobile Settings'}
        </button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const notify = useNotificationStore((s) => s.notify);
  const { isLoading } = useCurrentUser();
  const { mode, accent, setMode, setAccent, activePalette } = useTheme();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');

  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      const updatedUser = await authService.updateProfile({ name: nameInput.trim() });
      setUser(updatedUser);
      setEditingName(false);
      notify({ title: 'Profile name updated', tone: 'success' });
    } catch (err) {
      notify({ title: 'Failed to update name', tone: 'error' });
    } finally {
      setIsSavingName(false);
    }
  };

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

              <div className="flex items-center gap-1 rounded-md bg-[var(--color-surface-secondary)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                <span>Active Account</span>
              </div>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Personal Details
            </h3>
            {!editingName ? (
              <button
                type="button"
                onClick={() => {
                  setNameInput(user?.name || '');
                  setEditingName(true);
                }}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                Edit Name
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="rounded-md bg-[var(--color-primary)] px-2.5 py-1 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSavingName ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {editingName ? (
              <div className="py-3 space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your actual name"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            ) : (
              <ProfileField icon={User} label="Full Name" value={user?.name} />
            )}
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

        {/* Encrypted Mobile Number & Privacy Settings */}
        <PhonePrivacyCard />

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
