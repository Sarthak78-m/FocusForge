import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Calendar,
  Timer,
  FileText,
  GitBranch,
  Target,
  BarChart3,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { paths } from '@/routes/paths';
import { useAppStore } from '@/store/appStore';
import { useNotes } from '@/hooks/useNotes';
import type { Note } from '@/types/notes';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/utils/cn';

export function TodoistSidebar() {
  const leftSidebarOpen = useAppStore((s) => s.leftSidebarOpen);
  const openCreateTaskModal = useAppStore((s) => s.openCreateTaskModal);
  const { data: notes = [] } = useNotes();
  const typedNotes: Note[] = notes;
  const { data: tasksData } = useTasks({ size: 100 });
  const [projectsOpen, setProjectsOpen] = useState(true);
  const navigate = useNavigate();

  const totalTasks = tasksData?.totalElements ?? 0;
  const todayDayNumber = new Date().getDate();

  if (!leftSidebarOpen) return null;

  return (
    <aside
      className="w-60 flex-none border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between select-none overflow-y-auto"
      style={{ height: 'calc(100vh - 48px)' }}
    >
      <div className="p-3 space-y-3">
        {/* Quick Add Task Button */}
        <button
          type="button"
          onClick={openCreateTaskModal}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors group"
        >
          <div className="h-5 w-5 rounded-md flex items-center justify-center bg-[var(--color-primary)] text-white group-hover:opacity-90 transition-opacity">
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
          <span>Add task</span>
        </button>



        {/* Primary Navigation */}
        <nav className="space-y-0.5">

          {/* Inbox */}
          <NavLink
            to={paths.tasks}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span>Inbox</span>
            </div>
            {totalTasks > 0 && (
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-semibold">
                {totalTasks}
              </span>
            )}
          </NavLink>

          {/* Today */}
          <NavLink
            to={paths.dashboard}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <Calendar className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <span className="absolute text-[8px] font-bold text-[var(--color-text-secondary)] mt-0.5">
                  {todayDayNumber}
                </span>
              </div>
              <span>Today</span>
            </div>
          </NavLink>

          {/* Focus Timer */}
          <NavLink
            to={paths.pomodoro}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <Timer className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span>Focus Timer</span>
            </div>
          </NavLink>

          {/* Notes */}
          <NavLink
            to={paths.notes}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span>Notes</span>
            </div>
            {notes.length > 0 && (
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-semibold">
                {notes.length}
              </span>
            )}
          </NavLink>

          {/* Knowledge Graph */}
          <NavLink
            to={paths.graph}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <GitBranch className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span>Knowledge Graph</span>
            </div>
          </NavLink>

          {/* Goals */}
          <NavLink
            to={paths.goals}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <Target className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span>Goals</span>
            </div>
          </NavLink>

          {/* Productivity Stats */}
          <NavLink
            to={paths.analytics}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span>Productivity</span>
            </div>
          </NavLink>

        </nav>

        {/* User Tags & Folders Section */}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <div
            onClick={() => setProjectsOpen((v) => !v)}
            className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold">Tags & Subjects</span>
            {projectsOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </div>

          {projectsOpen && (
            <div className="mt-1 space-y-0.5">
              {Array.from(new Set(typedNotes.flatMap((n) => n.tags || []))).length === 0 ? (
                <div className="px-3 py-2 text-2xs text-[var(--color-text-tertiary)] italic">
                  No tags yet. Add #tags to your notes.
                </div>
              ) : (
                Array.from(new Set(typedNotes.flatMap((n) => n.tags || []))).map((tag) => (
                  <NavLink
                    key={tag}
                    to={paths.tags}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] flex-none" />
                      <span className="truncate">#{tag}</span>
                    </div>
                  </NavLink>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
