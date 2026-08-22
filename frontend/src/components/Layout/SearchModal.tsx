import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Hash, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleFavoriteNote } from '@/hooks/useNotes';
import type { Note } from '@/types/notes';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../lib/utils';

export function SearchModal() {
  const open = useAppStore((s) => s.searchOpen);
  const setOpen = useAppStore((s) => s.setSearchOpen);
  const { data: notes = [] } = useNotes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes.slice(0, 8);
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 10);
  }, [notes, query]);

  function go(id: number) {
    setOpen(false);
    navigate(`/notes/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) go(results[activeIndex].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b border-[var(--color-border)]">
          <Search className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search notes, tags, content…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--color-text-tertiary)]"
            aria-label="Search"
          />
          <IconButton size="sm" label="Close" onClick={() => setOpen(false)}>
            <X className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
              No notes found for "{query}"
            </div>
          ) : (
            results.map((n, i) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors',
                  activeIndex === i
                    ? 'bg-[var(--color-accent-soft)]'
                    : 'hover:bg-[var(--color-card-hover)]',
                )}
              >
                <FileText className="h-4 w-4 mt-0.5 text-[var(--color-text-secondary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">
                    {n.title}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] truncate">
                    {n.preview}
                  </div>
                </div>
                {n.tags[0] && (
                  <span className="text-2xs text-[var(--color-text-tertiary)] flex items-center gap-1 shrink-0">
                    <Hash className="h-3 w-3" />
                    {n.tags[0]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 h-9 border-t border-[var(--color-border)] text-2xs text-[var(--color-text-tertiary)]">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card-hover)]">↑↓</kbd> navigate ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card-hover)]">↵</kbd> open ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-card-hover)]">esc</kbd> close
          </span>
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
