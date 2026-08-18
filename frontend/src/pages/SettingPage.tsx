import { useAppStore } from '../store/appStore';
import { useNoteStore } from '../store/noteStore';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sun, Moon, Database, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const notes = useNoteStore((s) => s.notes);
  const initialize = useNoteStore((s) => s.initialize);

  async function handleReset() {
    if (!window.confirm('Reset all local data and reseed sample notes?')) return;
    const { notesRepo, activityRepo, metaRepo } = await import(
      '../lib/database/notesRepository'
    );
    await notesRepo.clear();
    await activityRepo.clear();
    await metaRepo.set('initialized', false);
    location.reload();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Preferences and data management for your workspace.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                Choose how NovaNote looks
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)]">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-[var(--color-card)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <Moon className="h-3 w-3" />
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-[var(--color-card)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <Sun className="h-3 w-3" />
                Light
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" />
                Local data
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                {notes.length} notes stored in IndexedDB on this device
              </div>
            </div>
            <Button
              variant="danger"
              iconLeft={<Trash2 className="h-3.5 w-3.5" />}
              onClick={handleReset}
            >
              Reset & reseed
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-[var(--color-text-secondary)] space-y-1">
            <p>
              <strong className="text-[var(--color-text)]">NovaNote</strong> · A local-first
              knowledge workspace.
            </p>
            <p className="text-2xs text-[var(--color-text-tertiary)]">
              Built with React, TypeScript, Vite, Tailwind CSS, Zustand, and IndexedDB.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
