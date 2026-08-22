import {
  FilePlus,
  Edit3,
  Link2,
  Tag,
  Star,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { formatRelativeTime } from '../../lib/utils';
import type { ActivityType } from '../../types';

const iconMap: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  create: FilePlus,
  edit: Edit3,
  link: Link2,
  tag: Tag,
  favorite: Star,
};

const colorMap: Record<ActivityType, string> = {
  create: 'text-emerald-500 bg-emerald-500/10',
  edit: 'text-sky-500 bg-sky-500/10',
  link: 'text-violet-500 bg-violet-500/10',
  tag: 'text-amber-500 bg-amber-500/10',
  favorite: 'text-rose-500 bg-rose-500/10',
};

export function ActivityTimeline() {
  // TODO: Requires backend /api/activities endpoint to implement properly
  const activity: any[] = [];

  if (activity.length === 0) {
    return (
      <section>
        <SectionHeader title="Recent Activity" />
        <EmptyState
          icon={<ActivityIcon className="h-5 w-5" />}
          title="Not hooked up to backend"
          description="Activity tracking requires the /api/activities endpoint to be implemented."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title="Recent Activity" />
      <Card className="p-2">
        <ul className="space-y-0.5">
          {activity.slice(0, 6).map((a) => {
            const Icon = iconMap[a.type as ActivityType] ?? ActivityIcon;
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--color-card-hover)] transition-colors"
              >
                <div
                  className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${colorMap[a.type as ActivityType]}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-[var(--color-text)] flex-1 truncate">
                  {a.description}
                </span>
                <span className="text-2xs text-[var(--color-text-tertiary)] shrink-0">
                  {formatRelativeTime(a.timestamp)}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-[var(--color-text)] tracking-tight">
        {title}
      </h2>
    </div>
  );
}
