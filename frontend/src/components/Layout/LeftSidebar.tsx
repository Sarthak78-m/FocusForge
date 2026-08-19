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
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Timer,
  MessageSquare,
  BarChart2,
  Target,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useNoteStore } from '../../store/noteStore';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../lib/utils';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
}

export function LeftSidebar() {
  const open = useAppStore((s) => s.leftSidebarOpen);
  const toggle = useAppStore((s) => s.toggleLeftSidebar);
  const notes = useNoteStore((s) => s.notes);

  const studyTools: NavItem[] = [
    { to: '/', icon: Home, label: 'Overview', end: true },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/focus', icon: Timer, label: 'Focus Timer' },
    { to: '/chat', icon: MessageSquare, label: 'Productivity Chat' },
    { to: '/progress', icon: BarChart2, label: 'Progress & Stats' },
    { to: '/goals', icon: Target, label: 'Goals' },
  ];

  const notesSection: NavItem[] = [
    { to: '/notes', icon: FileText, label: 'All Notes' },
    { to: '/favorites', icon: Star, label: 'Favorites' },
    { to: '/recent', icon: Clock, label: 'Recent' },
  ];

  const knowledge: NavItem[] = [
    { to: '/folders', icon: Folder, label: 'Folders' },
    { to: '/tags', icon: Tag, label: 'Tags' },
    { to: '/graph', icon: GitBranch, label: 'Graph View' },
    { to: '/backlinks', icon: Link2, label: 'Backlinks' },
  ];

  if (!open) {
    return (
      <aside className="hidden lg:flex w-12 shrink-0 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex-col items-center py-3 gap-2">
        <IconButton size="md" label="Expand sidebar" onClick={toggle}>
          <ChevronsRight className="h-4 w-4" />
        </IconButton>
        <div className="w-7 h-px bg-[var(--color-border)] my-2" />
        {studyTools.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'h-8 w-8 rounded-md flex items-center justify-center transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)]',
              )
            }
          >
            <item.icon className="h-4 w-4" />
          </NavLink>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-60 shrink-0 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <Section title="Focus & Study" items={studyTools} />
        <Section title="Notes & Notebook" items={notesSection} noteCounts={{ '/notes': notes.length }} />
        <Section title="Knowledge Graph" items={knowledge} />
      </nav>



      <div className="border-t border-[var(--color-border)] p-3 space-y-1">
        <SidebarLink to="/settings" icon={Settings} label="Settings" />
        <SidebarLink to="/help" icon={HelpCircle} label="Help" />
        <button
          onClick={toggle}
          className="hidden lg:flex w-full items-center gap-2 px-2 h-8 rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)] transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" />
          Collapse
        </button>
      </div>
    </aside>
  );
}

function Section({
  title,
  items,
  noteCounts = {},
}: {
  title: string;
  items: NavItem[];
  noteCounts?: Record<string, number>;
}) {
  return (
    <div>
      <div className="px-2 mb-1.5 text-2xs uppercase tracking-wider font-medium text-[var(--color-text-tertiary)]">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarLink
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

function SidebarLink({
  to,
  icon: Icon,
  label,
  end,
  count,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
  count?: number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-2 h-8 rounded-md text-sm transition-colors',
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
