import { FileText, Type, Link2, Tag as TagIcon } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { RecentNotes } from './RecentNotes';
import { FavoriteNotes } from './FavoriteNotes';
import { ActivityTimeline } from './ActivityTimeline';
import { getGreeting, getGreetingEmoji, countLinks } from '../../lib/utils';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
  return n.toString();
}

export function Dashboard() {
  const { data: notes = [], isLoading } = useNotes();

  const totalNotes = notes.length;
  const totalWords = notes.reduce((acc, n) => acc + (n.wordCount || 0), 0);
  const totalLinks = notes.reduce((acc, n) => acc + countLinks(n.content || ''), 0);
  const totalTags = new Set(notes.flatMap((n) => n.tags || [])).size;
  const greeting = `${getGreeting()} ${getGreetingEmoji()}`;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-[var(--color-card)] animate-pulse" />
          <div className="h-4 w-40 rounded bg-[var(--color-card)] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {greeting}
          </h1>
        </div>
        <QuickActions />
      </div>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Notes" value={totalNotes} hint="Total notes" icon={FileText} color="violet" />
        <StatCard label="Words" value={formatNumber(totalWords)} hint="Words written" icon={Type} color="sky" />
        <StatCard label="Links" value={totalLinks} hint="Connections" icon={Link2} color="amber" />
        <StatCard label="Tags" value={totalTags} hint="Organized topics" icon={TagIcon} color="emerald" />
      </section>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RecentNotes />
        </div>
        <div className="space-y-6">
          <FavoriteNotes />
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
