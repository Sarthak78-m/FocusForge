import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, FileText } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { formatRelativeTime, formatDate, cn } from '../lib/utils';

/** Group notes by day bucket: Today / Yesterday / This week / Older */
function getDayGroup(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const DAY = 86_400_000;
  if (diff < DAY) return 'Today';
  if (diff < 2 * DAY) return 'Yesterday';
  if (diff < 7 * DAY) return 'This week';
  if (diff < 30 * DAY) return 'This month';
  return 'Older';
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This week', 'This month', 'Older'];

export function RecentPage() {
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const createNote = useNoteStore((s) => s.createNote);

  const groups = useMemo(() => {
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    const map = new Map<string, typeof notes>();
    for (const n of sorted) {
      const g = getDayGroup(n.updatedAt);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(n);
    }
    // Return in display order, skipping empty groups
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      label: g,
      notes: map.get(g)!,
    }));
  }, [notes]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-[var(--color-accent)]" />
            Recent
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''}, grouped by activity
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

      {/* Groups */}
      {groups.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-5 w-5" />}
          title="No notes yet"
          description="Create your first note and it will appear here grouped by day."
          action={
            <Button
              variant="primary"
              onClick={async () => {
                const id = await createNote();
                navigate(`/notes/${id}`);
              }}
            >
              Create a note
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, notes: groupNotes }) => (
            <div key={label}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 px-1">
                {label}
              </h2>
              <Card>
                <ul className="divide-y divide-[var(--color-border)]">
                  {groupNotes.map((n) => (
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
                        onClick={(ev) => {
                          ev.stopPropagation();
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
                        <Badge variant="default">{n.folder}</Badge>
                        {n.tags.slice(0, 1).map((t) => (
                          <Badge key={t} variant="accent">#{t}</Badge>
                        ))}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)] shrink-0 hidden md:block text-right">
                        <div>{formatRelativeTime(n.updatedAt)}</div>
                        <div className="text-2xs">{formatDate(n.updatedAt)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
