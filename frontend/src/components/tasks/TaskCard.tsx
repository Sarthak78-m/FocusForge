import { CheckCircle2, Circle, Clock, Flag, Hash, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import type { Task, TaskPriority } from '@/types/task';

const PRIORITY_FLAGS: Record<TaskPriority, { label: string; flagColor: string; bgClass: string }> = {
  HIGH: { label: 'P1', flagColor: '#E44332', bgClass: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:text-rose-300' },
  MEDIUM: { label: 'P2', flagColor: '#FF7A00', bgClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-300' },
  LOW: { label: 'P3', flagColor: '#0058BF', bgClass: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-300' },
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
        'group relative flex items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-200',
        'border-[var(--color-border)] bg-white shadow-xs dark:bg-[var(--color-surface)]',
        'hover:shadow-md hover:border-[var(--color-primary-subtle)] hover:-translate-y-0.5',
        isCompleted && 'opacity-60 bg-slate-50/70 dark:bg-slate-900/50',
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Stitch Circular 24px Checkbox */}
        <button
          type="button"
          onClick={() => !isCompleted && onComplete(task.id)}
          disabled={isCompleted || isCompleting}
          aria-label={isCompleted ? 'Task completed' : 'Mark as complete'}
          className={cn(
            'mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]',
            isCompleted
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border-strong)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-transparent hover:text-[var(--color-primary)] dark:bg-slate-900',
            isCompleting && 'animate-pulse',
          )}
        >
          <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3
            className={cn(
              'text-sm font-semibold text-[var(--color-text-primary)] leading-tight',
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
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Priority Flag Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold',
                priority.bgClass,
              )}
            >
              <Flag className="h-3 w-3" style={{ fill: priority.flagColor, color: priority.flagColor }} />
              {priority.label}
            </span>

            {/* Hashtag Project Tag */}
            <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
              <Hash className="h-2.5 w-2.5" />
              ExamPrep
            </span>

            {/* Due Date Pill */}
            {due && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                  due.isOverdue && !isCompleted
                    ? 'border-rose-200 bg-rose-50 text-rose-600 font-bold dark:bg-rose-950 dark:text-rose-300'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] bg-slate-50 dark:bg-slate-900',
                )}
              >
                <Clock className="h-3 w-3" />
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
