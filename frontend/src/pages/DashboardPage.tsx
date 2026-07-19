import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock3, Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useTasks, useCreateTask, useCompleteTask } from '@/hooks/useTasks';
import { usePomodoro } from '@/hooks/usePomodoro';
import { paths } from '@/routes/paths';
import type { Task, TaskStatus } from '@/types/task';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import { Button } from '@/components/common';

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

type QuickStatProps = {
  label: string;
  value: string | number;
  sub: string;
  className?: string;
};

function QuickStat({ label, value, sub, className }: QuickStatProps) {
  return (
    <div className={cn('rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-stone-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{sub}</p>
    </div>
  );
}

const STATUS_ICON: Record<TaskStatus, React.ElementType> = {
  TODO: Circle,
  IN_PROGRESS: Clock3,
  COMPLETED: CheckCircle2,
};

function RecentTaskRow({ task, onComplete }: { task: Task; onComplete: (id: number) => void }) {
  const Icon = STATUS_ICON[task.status];
  const isCompleted = task.status === 'COMPLETED';
  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        onClick={() => !isCompleted && onComplete(task.id)}
        disabled={isCompleted}
        className={cn(
          'flex-none transition-colors',
          isCompleted
            ? 'text-emerald-500'
            : 'text-stone-300 hover:text-emerald-500 dark:text-stone-600',
        )}
      >
        <Icon className="h-4 w-4" />
      </button>
      <span
        className={cn(
          'flex-1 truncate text-sm text-stone-700 dark:text-stone-300',
          isCompleted && 'line-through text-stone-400',
        )}
      >
        {task.title}
      </span>
      {task.dueDate && (
        <span className="text-xs text-stone-400 dark:text-stone-500">
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}

function PomodoroWidget() {
  const { mode, display, isRunning, sessionCount, start, pause, reset } = usePomodoro();

  const modeLabel = mode === 'work' ? 'Focus' : mode === 'short-break' ? 'Short Break' : 'Long Break';

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
            Pomodoro
          </p>
          <p className="mt-0.5 text-sm font-medium text-stone-700 dark:text-stone-300">{modeLabel}</p>
        </div>
        <span className="text-xs text-stone-400">{sessionCount} sessions</span>
      </div>
      <div className="text-3xl font-mono font-semibold tracking-tight text-stone-900 dark:text-white">
        {display}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-900"
        >
          Reset
        </button>
        <Link
          to={paths.pomodoro}
          className="ml-auto flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          Full timer
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function QuickAddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Quick add a task..."
        className={cn(
          'h-9 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-sm',
          'text-stone-900 placeholder:text-stone-400',
          'dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500',
        )}
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
        aria-label="Add task"
      >
        <Plus className="h-4 w-4" />
      </button>
    </form>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: tasksData, isLoading } = useTasks({ size: 5 });
  const { mutate: createTask } = useCreateTask();
  const { mutate: completeTask } = useCompleteTask();

  const tasks = tasksData?.content ?? [];
  const totalElements = tasksData?.totalElements ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = tasks.filter(
    (t) => t.status === 'COMPLETED' && t.completedAt?.startsWith(today),
  ).length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todo = tasks.filter((t) => t.status === 'TODO').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-white">
          {getHour()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickStat label="Total Tasks" value={isLoading ? '—' : totalElements} sub="in your workspace" />
        <QuickStat label="To Do" value={isLoading ? '—' : todo} sub="need attention" />
        <QuickStat label="In Progress" value={isLoading ? '—' : inProgress} sub="actively working" />
        <QuickStat label="Done Today" value={isLoading ? '—' : completedToday} sub="completed today" />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Tasks column */}
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-white">Recent tasks</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">Showing last 5</p>
            </div>
            <Link
              to={paths.tasks}
              className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-900"
            >
              All tasks
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-5 pb-3 pt-2">
            <QuickAddTask
              onAdd={(title) => createTask({ title })}
            />
          </div>
          <div className="divide-y divide-stone-100 px-5 dark:divide-stone-800/50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
                  <div className="h-3 flex-1 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                </div>
              ))
            ) : tasks.length === 0 ? (
              <div className="py-10 text-center text-sm text-stone-400 dark:text-stone-500">
                No tasks yet. Quick-add one above.
              </div>
            ) : (
              tasks.map((task) => (
                <RecentTaskRow
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                />
              ))
            )}
          </div>
          {tasks.length > 0 && (
            <div className="px-5 py-3">
              <Link
                to={paths.tasks}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                View all {totalElements} tasks →
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <PomodoroWidget />

          {/* Quick links */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
              Quick nav
            </p>
            <div className="space-y-1">
              {[
                { label: 'Manage tasks', to: paths.tasks },
                { label: 'Focus timer', to: paths.pomodoro },
                { label: 'My profile', to: paths.profile },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-900"
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
