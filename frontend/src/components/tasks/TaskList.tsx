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
    <div className="flex items-start gap-3 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <div className="mt-0.5 h-5 w-5 flex-none animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="flex gap-2">
          <div className="h-5 w-14 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
          <ClipboardList className="h-6 w-6 text-stone-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">No tasks found</p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
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
