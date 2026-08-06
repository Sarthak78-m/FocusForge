import { CheckCircle2, Circle, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/common';
import { cn } from '@/utils/cn';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  HIGH: { label: 'High', className: 'bg-error-50 text-error-700 ring-error-200 dark:bg-error-950 dark:text-error-300 dark:ring-error-800' },
  MEDIUM: { label: 'Medium', className: 'bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-950 dark:text-warning-300 dark:ring-warning-800' },
  LOW: { label: 'Low', className: 'bg-primary-50 text-text-primary ring-primary-200 dark:bg-primary-950 dark:text-[var(--color-text-primary)] dark:ring-primary-800' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: 'To Do', className: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-950 dark:text-primary-300 dark:ring-primary-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-accent-50 text-accent-700 ring-accent-200 dark:bg-accent-950 dark:text-accent-300 dark:ring-accent-800' },
  COMPLETED: { label: 'Completed', className: 'bg-success-50 text-success-700 ring-success-200 dark:bg-success-950 dark:text-success-300 dark:ring-success-800' },
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
  const isOverdue = d < now && dateStr.length === 10; // date-only string
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue,
  };
}

export function TaskCard({ task, onComplete, onEdit, onDelete, isCompleting }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompleted = task.status === 'COMPLETED';
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const due = formatDate(task.dueDate);

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border p-4 transition-all duration-200',
        'border-[var(--color-border)] bg-white shadow-soft dark:bg-[var(--color-surface)]',
        'hover:shadow-elevated hover:border-primary-200 dark:hover:border-primary-900',
        isCompleted && 'opacity-60',
      )}
    >
      {/* Complete toggle */}
      <button
        type="button"
        onClick={() => !isCompleted && onComplete(task.id)}
        disabled={isCompleted || isCompleting}
        aria-label={isCompleted ? 'Task completed' : 'Mark as complete'}
        className={cn(
          'mt-0.5 flex-none transition-colors',
          isCompleted
            ? 'text-success-500'
            : 'text-text-secondary hover:text-success-500 dark:text-[var(--color-text-secondary)] dark:hover:text-success-400',
          isCompleting && 'animate-pulse',
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-[var(--color-text-primary)]',
            isCompleted && 'line-through text-text-secondary opacity-75',
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge className={cn('ring-1', priority.className)}>{priority.label}</Badge>
          <Badge className={cn('ring-1', status.className)}>{status.label}</Badge>
          {due && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                due.isOverdue && !isCompleted
                  ? 'text-error-600 dark:text-error-400 font-medium'
                  : 'text-text-secondary dark:text-[var(--color-text-secondary)]',
              )}
            >
              <Clock className="h-3 w-3" />
              {due.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions menu */}
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-1 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary-50 hover:text-[var(--color-text-primary)] dark:hover:bg-primary-950"
          aria-label="Task options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-elevated dark:bg-[var(--color-surface)]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-primary-50 dark:hover:bg-primary-950"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-950"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
