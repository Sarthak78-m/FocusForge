import { TaskCard } from './TaskCard';
import type { Task } from '@/types/task';
import { ClipboardList } from 'lucide-react';

type TaskListProps = {
  tasks: Task[];
  isLoading?: boolean;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  completingId?: number | null;
};

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-soft dark:bg-[var(--color-surface)]">
      <div className="mt-0.5 h-5 w-5 flex-none animate-pulse rounded-full bg-primary-100 dark:bg-primary-900/40" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-primary-100 dark:bg-primary-900/40" />
        <div className="h-3 w-1/2 animate-pulse rounded-md bg-primary-50 dark:bg-primary-900/20" />
        <div className="flex gap-2">
          <div className="h-5 w-14 animate-pulse rounded-full bg-primary-50 dark:bg-primary-900/30" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-primary-50 dark:bg-primary-900/30" />
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks, isLoading, onComplete, onEdit, onDelete, completingId }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-16 text-center shadow-soft dark:bg-[var(--color-surface)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-950 dark:text-primary-400">
          <ClipboardList className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">No tasks found</p>
        <p className="mt-1 text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
          Create a task or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          isCompleting={completingId === task.id}
        />
      ))}
    </div>
  );
}
