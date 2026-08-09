import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useTasks, useCreateTask, useCompleteTask } from '@/hooks/useTasks';
import { usePomodoro } from '@/hooks/usePomodoro';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import type { Task, TaskStatus } from '@/types/task';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_ICON: Record<TaskStatus, React.ElementType> = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
};

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS — BENTO WIDGETS
   ══════════════════════════════════════════════════════════ */

function StatCard({ label, value, change, icon: Icon, color }: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bento-card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: color }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        {change && (
          <span className="text-xs font-medium text-success">{change}</span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </p>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function PomodoroCard() {
  const { mode, display, isRunning, sessionCount, start, pause, reset } = usePomodoro();
  const modeLabel = mode === 'work' ? 'Focus' : mode === 'short-break' ? 'Short Break' : 'Long Break';
  const percentage = 75; // Mock progress for the ring

  return (
    <div className="bento-card flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Pomodoro Timer
            </p>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {modeLabel}
          </p>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {sessionCount} sessions
        </span>
      </div>

      {/* Timer Display with Ring */}
      <div className="relative mx-auto">
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        {/* Timer text centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {display}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ background: 'var(--color-primary)' }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-[var(--color-surface-secondary)]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function TaskListCard() {
  const { data: tasksData, isLoading } = useTasks({ size: 6 });
  const { mutate: createTask } = useCreateTask();
  const { mutate: completeTask } = useCompleteTask();
  const [newTaskValue, setNewTaskValue] = useState('');

  const tasks = tasksData?.content ?? [];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskValue.trim();
    if (!trimmed) return;
    createTask({ title: trimmed });
    setNewTaskValue('');
  };

  const handleToggle = (task: Task) => {
    if (task.status !== 'COMPLETED') {
      completeTask(task.id);
    }
  };

  return (
    <div className="bento-card flex flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-secondary)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Task List
          </p>
        </div>
        <Link
          to={paths.tasks}
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: 'var(--color-secondary)' }}
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Quick add */}
      <form onSubmit={handleAddTask} className="mb-3 flex gap-2">
        <input
          type="text"
          value={newTaskValue}
          onChange={(e) => setNewTaskValue(e.target.value)}
          placeholder="Add a task..."
          className="h-9 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 text-sm transition-all duration-200 placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-strong)] focus:outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <button
          type="submit"
          disabled={!newTaskValue.trim()}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-white transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-primary)' }}
          aria-label="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {/* Task rows */}
      <div className="flex-1 space-y-1 overflow-y-auto" style={{ maxHeight: '280px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--color-surface-secondary)]" />
              <div className="h-3 flex-1 animate-pulse rounded bg-[var(--color-surface-secondary)]" />
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No tasks yet. Add one above!
          </div>
        ) : (
          tasks.map((task) => {
            const Icon = STATUS_ICON[task.status];
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface-secondary)]"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(task)}
                  disabled={isCompleted}
                  className={cn(
                    'flex-none transition-colors',
                    isCompleted
                      ? 'text-success cursor-default'
                      : 'text-[var(--color-text-tertiary)] hover:text-success',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
                <span
                  className={cn(
                    'flex-1 truncate text-sm',
                    isCompleted
                      ? 'text-[var(--color-text-secondary)] line-through opacity-60'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {task.title}
                </span>
                {task.dueDate && !isCompleted && (
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StreakCard() {
  return (
    <div
      className="bento-card relative overflow-hidden p-5"
      style={{
        background: 'linear-gradient(135deg, #FF9F0A 0%, #FFD060 100%)',
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20"
        style={{ background: '#FFFFFF' }}
      />
      <div
        className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full opacity-10"
        style={{ background: '#FFFFFF' }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-white" />
          <p className="text-sm font-semibold text-white">Study Streak</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-white">14</p>
          <p className="mt-0.5 text-sm text-white/90">days in a row</p>
        </div>
        <p className="text-xs text-white/80">Keep it up! 🔥</p>
      </div>
    </div>
  );
}

function QuickStatsCard() {
  const { data: tasksData } = useTasks({ size: 100 });
  const tasks = tasksData?.content ?? [];

  const completedToday = tasks.filter(
    (t) => t.status === 'COMPLETED' && t.completedAt?.startsWith(new Date().toISOString().slice(0, 10)),
  ).length;

  return (
    <div className="bento-card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Today's Progress
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl border border-[var(--color-border)] p-3"
          style={{ background: 'var(--color-surface-secondary)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {completedToday}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Tasks Done
          </p>
        </div>

        <div
          className="rounded-xl border border-[var(--color-border)] p-3"
          style={{ background: 'var(--color-surface-secondary)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            2.5h
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Focus Time
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickLinksCard() {
  const links = [
    { label: 'Set a goal', to: paths.goals, icon: Target },
    { label: 'View analytics', to: paths.analytics, icon: TrendingUp },
    { label: 'Browse rewards', to: paths.rewards, icon: Flame },
  ];

  return (
    <div className="bento-card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Quick Actions
        </p>
      </div>

      <div className="space-y-1">
        {links.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 hover:bg-[var(--color-surface-secondary)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Icon className="h-4 w-4 flex-none" />
            <span className="flex-1">{label}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ══════════════════════════════════════════════════════════ */

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: tasksData } = useTasks({ size: 100 });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const tasks = tasksData?.content ?? [];
  const totalTasks = tasksData?.totalElements ?? 0;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-8 pb-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {getFormattedDate()}
        </p>
      </motion.div>

      {/* ── Bento Grid Layout ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="grid gap-5"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {/* Row 1: Quick stats (4 small cards on desktop) */}
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          icon={CheckCircle2}
          color="var(--color-secondary)"
        />
        <StatCard
          label="To Do"
          value={todoCount}
          icon={Circle}
          color="var(--color-warning)"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="var(--color-accent)"
        />
        <StreakCard />
      </motion.div>

      {/* ── Main Content Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* Left: Task list (spans 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <TaskListCard />
        </div>

        {/* Right column: Pomodoro + Quick actions */}
        <div className="space-y-5">
          <PomodoroCard />
          <QuickStatsCard />
          <QuickLinksCard />
        </div>
      </motion.div>
    </div>
  );
}
