import { X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { IconButton } from '../ui/IconButton';
import { RightSidebar } from './RightSidebar';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  Star,
  Clock,
  Folder,
  Tag,
  GitBranch,
  Link2,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleFavoriteNote } from '@/hooks/useNotes';
import type { Note } from '@/types/notes';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/notes', icon: FileText, label: 'All Notes' },
  { to: '/favorites', icon: Star, label: 'Favorites' },
  { to: '/recent', icon: Clock, label: 'Recent' },
];

export function MobileDrawer() {
  const drawer = useAppStore((s) => s.mobileDrawerOpen);
  const setDrawer = useAppStore((s) => s.setMobileDrawer);
  const { data: notes = [] } = useNotes();

  if (!drawer) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setDrawer(null)}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--color-sidebar)] border-r border-[var(--color-border)] h-full shadow-2xl flex flex-col animate-slide-in-left">
        <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--color-border)]">
          <span className="text-sm font-semibold">Menu</span>
          <IconButton size="sm" label="Close" onClick={() => setDrawer(null)}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          <MobileSection title="Workspace" items={navItems} noteCounts={{ '/notes': notes.length }} />
          <MobileSection
            title="Organization"
            items={[
              { to: '/folders', icon: Folder, label: 'Folders' },
              { to: '/tags', icon: Tag, label: 'Tags' },
            ]}
          />
          <MobileSection
            title="Knowledge"
            items={[
              { to: '/graph', icon: GitBranch, label: 'Graph' },
              { to: '/backlinks', icon: Link2, label: 'Backlinks' },
            ]}
          />
        </nav>

        <div className="border-t border-[var(--color-border)] p-3 space-y-0.5">
          <MobileLink to="/settings" icon={Settings} label="Settings" onClick={() => setDrawer(null)} />
          <MobileLink to="/help" icon={HelpCircle} label="Help" onClick={() => setDrawer(null)} />
        </div>
      </div>
    </div>
  );
}

function MobileSection({
  title,
  items,
  noteCounts = {},
}: {
  title: string;
  items: typeof navItems;
  noteCounts?: Record<string, number>;
}) {
  return (
    <div>
      <div className="px-2 mb-1.5 text-2xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)]">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <MobileLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            end={item.end}
            count={noteCounts[item.to]}
          />
        ))}
      </div>
    </div>
  );
}

function MobileLink({
  to,
  icon: Icon,
  label,
  end,
  count,
  onClick,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  const setDrawer = useAppStore((s) => s.setMobileDrawer);
  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => onClick?.() ?? setDrawer(null)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-2 h-9 rounded-md text-sm transition-colors',
          isActive
            ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)]',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {typeof count === 'number' && (
        <span className="text-2xs text-[var(--color-text-tertiary)]">{count}</span>
      )}
    </NavLink>
  );
}
