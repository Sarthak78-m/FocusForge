import { CheckCircle2, Circle, Clock, Flag, Hash, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import type { Task, TaskPriority } from '@/types/task';

const PRIORITY_FLAGS: Record<TaskPriority, { label: string; flagColor: string; bgClass: string }> = {
  HIGH: { label: 'P1', flagColor: '#db4c3f', bgClass: 'bg-[#fff5f5] text-[#db4c3f] border-[#fee2e2] dark:bg-[#3d2524] dark:border-[#5c3331] dark:text-[#ff8f85]' },
  MEDIUM: { label: 'P2', flagColor: '#ff9a00', bgClass: 'bg-[#fffbf0] text-[#ff9a00] border-[#fff3e0] dark:bg-[#332b1a] dark:border-[#524424] dark:text-[#ffc066]' },
  LOW: { label: 'P3', flagColor: '#4073ff', bgClass: 'bg-[#f5f8ff] text-[#4073ff] border-[#e0e7ff] dark:bg-[#1a233a] dark:border-[#2b395e] dark:text-[#8cb0ff]' },
};

type TaskCardProps = {
  task: Task;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  isCompleting?: boolean;
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const isOverdue = d < now && dateStr.length === 10;
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue,
  };
}

export function TaskCard({ task, onComplete, onEdit, onDelete, isCompleting }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompleted = task.status === 'COMPLETED';
  const priority = PRIORITY_FLAGS[task.priority] || PRIORITY_FLAGS.LOW;
  const due = formatDate(task.dueDate);

  return (
    <div
      className={cn(
        'group relative flex items-start justify-between gap-4 rounded-lg border p-3.5 transition-all duration-150',
        'border-[var(--color-border)] bg-[var(--color-surface)] shadow-card',
        'hover:border-[var(--color-border-strong)]',
        isCompleted && 'opacity-50 bg-[var(--color-surface-secondary)]',
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Todoist Circular Checkbox */}
        <button
          type="button"
          onClick={() => !isCompleted && onComplete(task.id)}
          disabled={isCompleted || isCompleting}
          aria-label={isCompleted ? 'Task completed' : 'Mark as complete'}
          className={cn(
            'mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all duration-150 focus:outline-none',
            isCompleted
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[#999999] hover:border-[var(--color-primary)] hover:bg-[#fff5f5] text-transparent hover:text-[var(--color-primary)] dark:hover:bg-[#3d2524]',
            isCompleting && 'animate-pulse',
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <h3
            className={cn(
              'text-sm font-medium text-[var(--color-text-primary)] leading-tight',
              isCompleted && 'line-through text-[var(--color-text-tertiary)]',
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="line-clamp-2 text-xs text-[var(--color-text-secondary)]">
              {task.description}
            </p>
          )}

          {/* Badges & Metadata */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {/* Priority Flag Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold border',
                priority.bgClass,
              )}
            >
              <Flag className="h-2.5 w-2.5" style={{ fill: priority.flagColor, color: priority.flagColor }} />
              {priority.label}
            </span>

            {/* Project Tag */}
            <span className="inline-flex items-center gap-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              <Hash className="h-2.5 w-2.5" />
              General
            </span>

            {/* Due Date Pill */}
            {due && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border',
                  due.isOverdue && !isCompleted
                    ? 'border-[#fee2e2] bg-[#fff5f5] text-[#db4c3f] font-bold dark:bg-[#3d2524] dark:border-[#5c3331]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)]',
                )}
              >
                <Clock className="h-2.5 w-2.5" />
                {due.label}
              </span>
            )}
          </div>
        </div>
      </div>


      {/* Context Actions Menu */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-1.5 text-[var(--color-text-secondary)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-[var(--color-text-primary)] dark:hover:bg-slate-800"
          aria-label="Task options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-[var(--color-border)] bg-white p-1 shadow-lg backdrop-blur-md dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit task
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task.id);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete task
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
