import { CheckCircle2, Circle, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/common';
import { cn } from '@/utils/cn';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  HIGH: { label: 'High', className: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800' },
  LOW: { label: 'Low', className: 'bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: 'To Do', className: 'bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800' },
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
        'group relative flex items-start gap-3 rounded-lg border p-4 transition-colors',
        'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950',
        'hover:border-stone-300 dark:hover:border-stone-700',
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
            ? 'text-emerald-500'
            : 'text-stone-300 hover:text-emerald-500 dark:text-stone-600 dark:hover:text-emerald-400',
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
            'text-sm font-medium text-stone-900 dark:text-stone-100',
            isCompleted && 'line-through',
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
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
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-stone-400 dark:text-stone-500',
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
          className="rounded p-1 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200"
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
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-stone-200 bg-white py-1 shadow-md dark:border-stone-700 dark:bg-stone-900">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
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
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
