import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRelativeTime } from '../lib/utils';

export function TagsPage() {
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Build tag → notes map, sorted by note count desc
  const tagMap = useMemo(() => {
    const map = new Map<string, typeof notes>();
    for (const note of notes) {
      for (const tag of note.tags) {
        if (!map.has(tag)) map.set(tag, []);
        map.get(tag)!.push(note);
      }
    }
    return new Map(
      [...map.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([tag, tagNotes]) => [
          tag,
          [...tagNotes].sort((a, b) => b.updatedAt - a.updatedAt),
        ]),
    );
  }, [notes]);

  const totalTags = tagMap.size;
  const totalTagged = useMemo(
    () => notes.filter((n) => n.tags.length > 0).length,
    [notes],
  );

  function toggleTag(tag: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight flex items-center gap-2">
          <Hash className="h-6 w-6 text-[var(--color-accent)]" />
          Tags
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {totalTags} tag{totalTags !== 1 ? 's' : ''} across {totalTagged} note{totalTagged !== 1 ? 's' : ''}
        </p>
      </div>

      {totalTags === 0 ? (
        <EmptyState
          icon={<Hash className="h-5 w-5" />}
          title="No tags yet"
          description="Add #tags to your note content or open a note to tag it."
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
          {[...tagMap.entries()].map(([tag, tagNotes]) => {
            const isOpen = expanded.has(tag);
            return (
              <Card key={tag} className="overflow-hidden">
                {/* Tag row */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-card-hover)] transition-colors text-left"
                  onClick={() => toggleTag(tag)}
                  aria-expanded={isOpen}
                >
                  <div className="h-7 w-7 rounded-md bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
                    <Hash className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-[var(--color-text)]">
                    {tag}
                  </span>
                  <Badge variant="accent" className="text-2xs">
                    {tagNotes.length} note{tagNotes.length !== 1 ? 's' : ''}
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
                    {tagNotes.map((n) => (
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
                        <FileText className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                            {n.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="default" className="hidden sm:inline-flex">
                            {n.folder}
                          </Badge>
                          <span className="text-xs text-[var(--color-text-tertiary)] hidden md:block">
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
