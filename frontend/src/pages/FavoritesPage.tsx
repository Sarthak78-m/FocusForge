import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search, FileText } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleFavoriteNote } from '@/hooks/useNotes';
import type { Note } from '@/types/notes';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { formatRelativeTime, cn } from '../lib/utils';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { data: notes = [] } = useNotes();
  const toggleFavorite = useToggleFavoriteNote();
  const createNote = useCreateNote();
  const [query, setQuery] = useState('');

  const favorites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (!n.favorite) return false;
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, query]);

  const totalFavorites = notes.filter((n) => n.favorite).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            Favorites
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {totalFavorites} starred note{totalFavorites !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          iconLeft={<FileText className="h-4 w-4" />}
          onClick={async () => {
            const id = await createNote.mutateAsync({ title: 'Untitled', content: '', folder: 'Inbox' }).then(n => n.id);
            navigate(`/notes/${id}`);
          }}
        >
          New Note
        </Button>
      </div>

      {/* Filter */}
      {totalFavorites > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter favorites…"
            className="w-full h-10 pl-9 pr-3 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none text-sm transition-colors"
            aria-label="Filter favorites"
          />
        </div>
      )}

      {/* List */}
      {favorites.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title={query ? 'No favorites match your search' : 'No favorites yet'}
          description={
            query
              ? 'Try a different search term.'
              : 'Star a note to pin it here for quick access.'
          }
          action={
            !query ? (
              <Button variant="secondary" onClick={() => navigate('/notes')}>
                Browse notes
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--color-border)]">
            {favorites.map((n) => (
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
                {/* Unfavorite inline */}
                <IconButton
                  size="sm"
                  label="Remove from favorites"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite.mutate(n.id);
                  }}
                >
                  <Star className={cn('h-4 w-4 fill-amber-400 text-amber-400')} />
                </IconButton>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {n.title}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                    {n.preview || 'Empty note'}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Badge variant="default">{n.folder}</Badge>
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
