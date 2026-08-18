import { useNavigate } from 'react-router-dom';
import { Star, Folder, Clock, FileText, Plus } from 'lucide-react';
import { useNoteStore } from '../../store/noteStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { IconButton } from '../ui/IconButton';
import { formatRelativeTime } from '../../lib/utils';

export function RecentNotes() {
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const createNote = useNoteStore((s) => s.createNote);

  const recent = [...notes]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);

  if (recent.length === 0) {
    return (
      <section>
        <SectionHeader title="Recent Notes" />
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="Your knowledge base is empty"
          description="Create your first note and start connecting ideas."
          action={
            <button
              onClick={async () => {
                const id = await createNote();
                navigate(`/notes/${id}`);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first note
            </button>
          }
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        title="Recent Notes"
        action={
          <button
            onClick={() => navigate('/recent')}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            View all
          </button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {recent.map((note) => (
          <Card
            key={note.id}
            className="group hover:border-[var(--color-border-strong)] hover:bg-[var(--color-card-hover)] transition-colors cursor-pointer"
            onClick={() => navigate(`/notes/${note.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/notes/${note.id}`);
              }
            }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                  {note.title}
                </h3>
                <IconButton
                  size="sm"
                  variant="default"
                  label={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(note.id);
                  }}
                  className="shrink-0 -mt-1 -mr-1"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      note.favorite
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[var(--color-text-tertiary)]'
                    }`}
                  />
                </IconButton>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {note.preview || 'Empty note'}
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap text-2xs">
                <Badge variant="default" className="gap-1">
                  <Folder className="h-2.5 w-2.5" />
                  {note.folder}
                </Badge>
                {note.tags.slice(0, 2).map((t) => (
                  <Badge key={t} variant="accent">#{t}</Badge>
                ))}
                <span className="ml-auto flex items-center gap-1 text-[var(--color-text-tertiary)]">
                  <Clock className="h-2.5 w-2.5" />
                  {formatRelativeTime(note.updatedAt)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
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
