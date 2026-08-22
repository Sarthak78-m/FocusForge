import os
p = 'frontend/src/components/Layout/TopHeader.tsx'
content = '''import { useNavigate } from 'react-router-dom';
import { Search, Plus, Sun, Moon, Menu } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useCreateNote } from '@/hooks/useNotes';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Logo } from '../ui/Logo';
import { WorkspaceMenu } from './WorkspaceMenu';
import { getModKey } from '../../lib/utils';

export function TopHeader() {
  const navigate = useNavigate();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const setMobileDrawer = useAppStore((s) => s.setMobileDrawer);
  const createNote = useCreateNote();

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
