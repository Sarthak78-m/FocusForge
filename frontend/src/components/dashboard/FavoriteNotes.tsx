import { useNavigate } from 'react-router-dom';
import { Star, Folder, Clock, StarOff } from 'lucide-react';
import { useNoteStore } from '../../store/noteStore';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';

export function FavoriteNotes() {
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const favorites = notes.filter((n) => n.favorite);

  if (favorites.length === 0) {
    return (
      <section>
        <SectionHeader title="Favorites" />
        <EmptyState
          icon={<StarOff className="h-5 w-5" />}
          title="No favorites yet"
          description="Star important notes to access them quickly."
          action={
            <Button variant="secondary" onClick={() => navigate('/notes')}>
              Browse Notes
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        title="Favorites"
        action={
          <button
            onClick={() => navigate('/favorites')}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            View all
          </button>
        }
      />
      <Card>
        <ul className="divide-y divide-[var(--color-border)]">
          {favorites.slice(0, 5).map((note) => (
            <li
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-card-hover)] cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/notes/${note.id}`);
                }
              }}
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-sm font-medium text-[var(--color-text)] truncate flex-1 group-hover:text-[var(--color-accent)] transition-colors">
                {note.title}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 shrink-0">
                <Folder className="h-3 w-3" />
                {note.folder}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1 shrink-0 hidden sm:flex">
                <Clock className="h-3 w-3" />
                {formatDate(note.updatedAt)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-[var(--color-text)] tracking-tight">
        {title}
      </h2>
      {action}
    </div>
  );
}
