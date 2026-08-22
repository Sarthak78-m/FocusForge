import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FolderOpen, FileText, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleFavoriteNote } from '@/hooks/useNotes';
import type { Note } from '@/types/notes';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeTime, cn } from '../lib/utils';

export function FoldersPage() {
  const navigate = useNavigate();
  const { data: notes = [] } = useNotes();
  const toggleFavorite = useToggleFavoriteNote();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Build folder → notes map sorted alphabetically
  const folderMap = useMemo(() => {
    const map = new Map<string, typeof notes>();
    for (const note of notes) {
      const folder = note.folder || 'Inbox';
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(note);
    }
    // Sort entries alphabetically; sort notes within each folder by updatedAt
    return new Map(
      [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([folder, folderNotes]) => [
          folder,
          [...folderNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        ]),
    );
  }, [notes]);

  const totalFolders = folderMap.size;

  function toggleFolder(folder: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight flex items-center gap-2">
          <Folder className="h-6 w-6 text-[var(--color-accent)]" />
          Folders
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {totalFolders} folder{totalFolders !== 1 ? 's' : ''} · {notes.length} note{notes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {totalFolders === 0 ? (
        <EmptyState
          icon={<Folder className="h-5 w-5" />}
          title="No folders yet"
          description="Folders are created automatically when you assign one to a note."
          action={
            <button
              className="text-sm text-[var(--color-accent)] hover:underline"
              onClick={() => navigate('/notes')}
            >
              Browse notes
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {[...folderMap.entries()].map(([folder, folderNotes]) => {
            const isOpen = expanded.has(folder);
            return (
              <Card key={folder} className="overflow-hidden">
                {/* Folder header row */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-card-hover)] transition-colors text-left"
                  onClick={() => toggleFolder(folder)}
                  aria-expanded={isOpen}
                >
                  <div className="h-7 w-7 rounded-md bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
                    {isOpen ? (
                      <FolderOpen className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium text-[var(--color-text)]">
                    {folder}
                  </span>
                  <Badge variant="default" className="text-2xs">
                    {folderNotes.length} note{folderNotes.length !== 1 ? 's' : ''}
                  </Badge>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                  )}
                </button>

                {/* Expanded note list */}
                {isOpen && (
                  <ul className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    {folderNotes.map((n) => (
                      <li
                        key={n.id}
                        onClick={() => navigate(`/notes/${n.id}`)}
                        className="group flex items-center gap-3 pl-14 pr-4 py-2.5 hover:bg-[var(--color-card-hover)] cursor-pointer transition-colors"
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
                            toggleFavorite.mutate(n.id);
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
                          <div className="text-sm text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                            {n.title}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                            {n.preview || 'Empty note'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {n.tags.slice(0, 1).map((t) => (
                            <Badge key={t} variant="accent" className="hidden sm:inline-flex">
                              #{t}
                            </Badge>
                          ))}
                          <span className="text-xs text-[var(--color-text-tertiary)] hidden md:block w-20 text-right">
                            {formatRelativeTime(n.updatedAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
