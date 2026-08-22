import os
p = 'frontend/src/components/Layout/TopHeader.tsx'
content = '''import { useNavigate } from 'react-router-dom';
import { Search, Plus, Bell, Sun, Moon, Menu, FileText, Link2, Tag, Heart } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useCreateNote } from '@/hooks/useNotes';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Logo } from '../ui/Logo';
import { WorkspaceMenu } from './WorkspaceMenu';
import { getModKey, formatRelativeTime } from '../../lib/utils';
import type { ActivityType } from '../../types';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  create:   <FileText className="h-3.5 w-3.5 text-emerald-500" />,
  edit:     <FileText className="h-3.5 w-3.5 text-sky-500" />,
  link:     <Link2   className="h-3.5 w-3.5 text-violet-500" />,
  tag:      <Tag     className="h-3.5 w-3.5 text-amber-500" />,
  favorite: <Heart   className="h-3.5 w-3.5 text-rose-500" />,
};

export function TopHeader() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const setMobileDrawer = useAppStore((s) => s.setMobileDrawer);
  const createNote = useCreateNote();

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  
  // TODO: Requires backend /api/activities endpoint to implement properly
  const recentActivity: any[] = [];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [bellOpen]);

  async function handleNew() {
    const note = await createNote.mutateAsync({ title: 'Untitled', content: '', folder: 'Inbox' });
    navigate(/notes/);
  }

  return (
    <header className="h-14 shrink-0 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] flex items-center px-3 sm:px-4 gap-3">
      <IconButton
        size="md"
        label="Open sidebar"
        className="lg:hidden"
        onClick={() => setMobileDrawer('left')}
      >
        <Menu className="h-4 w-4" />
      </IconButton>

      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="hidden sm:inline text-[15px] font-bold tracking-tight">
            MindSprint
          </span>
        </div>
        <span className="hidden md:block h-5 w-px bg-[var(--color-border)] mx-1" />
        <div className="hidden md:block">
          <WorkspaceMenu />
        </div>
      </div>

      <div className="flex-1 flex justify-center min-w-0">
        <button
          onClick={toggleSearch}
          className="flex items-center gap-2 w-full max-w-md h-8 px-3 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-card-hover)] text-[var(--color-text-secondary)] transition-colors text-sm"
          aria-label="Open search"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline truncate">Search notes...</span>
          <span className="sm:hidden truncate">Search</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center px-1.5 h-5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-2xs text-[var(--color-text-tertiary)] font-mono">
            {getModKey()} K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="primary"
          size="md"
          iconLeft={<Plus className="h-4 w-4" />}
          onClick={handleNew}
          className="hidden sm:inline-flex"
        >
          New Note
        </Button>
        <IconButton
          size="md"
          variant="filled"
          label="New note"
          className="sm:hidden"
          onClick={handleNew}
        >
          <Plus className="h-4 w-4" />
        </IconButton>

        {/* Bell with activity dropdown */}
        <div className="relative hidden sm:block" ref={bellRef}>
          <div className="relative">
            <IconButton
              size="md"
              label="Activity"
              onClick={() => setBellOpen((v) => !v)}
            >
              <Bell className="h-4 w-4" />
            </IconButton>
            {recentActivity.length > 0 && (
              <span className="pointer-events-none absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            )}
          </div>

          {bellOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-72 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-xl z-30 animate-fade-in overflow-hidden">
              <div className="px-3 py-2 border-b border-[var(--color-border)]">
                <span className="text-xs font-semibold text-[var(--color-text)]">Recent activity</span>
              </div>
              {recentActivity.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                    No activity yet
                  </p>
                  <p className="text-2xs text-amber-500/80">
                    (Requires backend /api/activities endpoint)
                  </p>
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
                  {recentActivity.map((a) => (
                    <li
                      key={a.id}
                      className={\lex items-start gap-2.5 px-3 py-2.5 text-xs \\}
                      onClick={() => {
                        if (a.noteId) {
                          navigate(\/notes/\\);
                          setBellOpen(false);
                        }
                      }}
                    >
                      <div className="h-5 w-5 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5">
                        {ACTIVITY_ICONS[a.type as ActivityType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--color-text)] leading-snug truncate">
                          {a.description}
                        </p>
                        <p className="text-[var(--color-text-tertiary)] mt-0.5">
                          {formatRelativeTime(a.timestamp)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <IconButton
          size="md"
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </IconButton>

        <div className="hidden sm:block ml-1">
          <Avatar name="You" />
        </div>
      </div>
    </header>
  );
}
'''
with open(p, 'w', encoding='utf-8') as f: f.write(content)
