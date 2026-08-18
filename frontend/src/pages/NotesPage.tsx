import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Star, Folder } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { formatRelativeTime, cn } from '../lib/utils';

export function NotesPage() {
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const createNote = useNoteStore((s) => s.createNote);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, query]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
            All Notes
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''} in your knowledge base
          </p>
        </div>
        <Button
          variant="primary"
          iconLeft={<FileText className="h-4 w-4" />}
          onClick={async () => {
            const id = await createNote();
            navigate(`/notes/${id}`);
          }}
        >
          New Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)] pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter notes…"
          className="w-full h-10 pl-9 pr-3 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none text-sm transition-colors"
          aria-label="Filter notes"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title={query ? 'No notes match your search' : 'Your knowledge base is empty'}
          description={
            query
              ? 'Try a different search term.'
              : 'Create your first note and start connecting ideas.'
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--color-border)]">
            {filtered.map((n) => (
              <li
                key={n.id}
                onClick={() => navigate(`/notes/${n.id}`)}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-card-hover)] cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/notes/${n.id}`);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(n.id);
                  }}
                  className="shrink-0"
                  aria-label={n.favorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Star
                    className={cn(
                      'h-4 w-4 transition-colors',
                      n.favorite
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[var(--color-text-tertiary)] hover:text-amber-400',
                    )}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {n.title}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                    {n.preview || 'Empty note'}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Badge variant="default" className="gap-1">
                    <Folder className="h-2.5 w-2.5" />
                    {n.folder}
                  </Badge>
                  {n.tags.slice(0, 1).map((t) => (
                    <Badge key={t} variant="accent">#{t}</Badge>
                  ))}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] shrink-0 hidden md:block w-20 text-right">
                  {formatRelativeTime(n.updatedAt)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
