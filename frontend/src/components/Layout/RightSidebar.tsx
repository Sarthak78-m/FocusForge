import { Lightbulb, Hash, Keyboard, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleFavoriteNote } from '@/hooks/useNotes';
import type { Note } from '@/types/notes';
import { IconButton } from '../ui/IconButton';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate, getModKey } from '../../lib/utils';

const QUOTES = [
  'Your second brain is only as good as what you actually revisit.',
  'Write to think, not to publish.',
  'Small notes, linked often, beat long notes read once.',
  'The best system is the one you actually use.',
  'Capture everything, organize later.',
];

export function RightSidebar() {
  const navigate = useNavigate();
  const open = useAppStore((s) => s.rightSidebarOpen);
  const setRight = useAppStore((s) => s.setRightSidebar);
  const setMobileDrawer = useAppStore((s) => s.setMobileDrawer);
  const { data: notes = [] } = useNotes();

  const tags = Array.from(
    new Set(notes.flatMap((n) => n.tags)),
  ).slice(0, 10);

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  if (!open) {
    return (
      <aside className="hidden xl:flex w-12 shrink-0 bg-[var(--color-sidebar)] border-l border-[var(--color-border)] flex-col items-center py-3 gap-2">
        <IconButton
          size="md"
          label="Open right sidebar"
          onClick={() => setRight(true)}
        >
          <Sparkles className="h-4 w-4" />
        </IconButton>
      </aside>
    );
  }

  return (
    <aside className="w-72 shrink-0 bg-[var(--color-sidebar)] border-l border-[var(--color-border)] flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--color-border)]">
        <span className="text-sm font-semibold">Insights</span>
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            label="Close"
            className="xl:hidden"
            onClick={() => setMobileDrawer(null)}
          >
            <X className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            size="sm"
            label="Hide panel"
            className="hidden xl:inline-flex"
            onClick={() => setRight(false)}
          >
            <X className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Daily quote */}
        <Card className="p-4">
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
              <Lightbulb className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            </div>
            <div>
              <div className="text-2xs uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
                Daily thought
              </div>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">"{quote}"</p>
            </div>
          </div>
        </Card>

        {/* Recent in sidebar */}
        <div>
          <div className="px-1 mb-2 flex items-center justify-between">
            <span className="text-2xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)]">
              Recent
            </span>
          </div>
          <div className="space-y-1">
            {recentNotes.map((n) => (
              <button
                key={n.id}
                onClick={() => navigate(`/notes/${n.id}`)}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-[var(--color-card-hover)] transition-colors group"
              >
                <div className="text-sm font-medium text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)]">
                  {n.title}
                </div>
                <div className="text-2xs text-[var(--color-text-tertiary)] mt-0.5">
                  {formatDate(n.updatedAt)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="px-1 mb-2 flex items-center justify-between">
            <span className="text-2xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)]">
              Popular tags
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 px-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1">
                <Hash className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-[var(--color-text-tertiary)]">No tags yet</span>
            )}
          </div>
        </div>

        {/* Shortcuts */}
        <div>
          <div className="px-1 mb-2">
            <span className="text-2xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)]">
              Shortcuts
            </span>
          </div>
          <Card className="p-3 space-y-2">
            <Shortcut label="Search" keys={`${getModKey()} K`} />
            <Shortcut label="New note" keys={`${getModKey()} N`} />
            <Shortcut label="Toggle sidebar" keys={`${getModKey()} B`} />
          </Card>
        </div>
      </div>
    </aside>
  );
}

function Shortcut({ label, keys }: { label: string; keys: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
        <Keyboard className="h-3 w-3" />
        {label}
      </span>
      <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-2xs text-[var(--color-text-tertiary)]">
        {keys}
      </kbd>
    </div>
  );
}
