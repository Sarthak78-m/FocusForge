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
  const { activePalette } = useTheme();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeDays = [true, true, true, true, true, false, true];

  return (
    <div
      className="bento-card relative overflow-hidden p-5 text-white shadow-lg transition-transform hover:scale-[1.02]"
      style={{ background: activePalette.gradient }}
    >
      <div className="relative z-10 flex flex-col justify-between h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 fill-white text-white animate-bounce" />
            <p className="text-xs font-bold uppercase tracking-wider text-white/90">Study Streak</p>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            🔥 On Fire!
          </span>
        </div>

        <div>
          <p className="text-4xl font-extrabold text-white">7 Days</p>
          <p className="mt-0.5 text-xs text-white/80">Active daily learning momentum</p>
        </div>

        {/* 7-day visual tracker */}
        <div className="flex items-center justify-between pt-2 border-t border-white/20">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-white/70">{d}</span>
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeDays[i]
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {activeDays[i] ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectDistributionCard() {
  const { activePalette } = useTheme();
  const subjects = [
    { name: 'Computer Science', hours: 4.5, pct: 45, color: '#4F46E5' },
    { name: 'Mathematics', hours: 2.5, pct: 25, color: '#0EA5E9' },
    { name: 'Physics & Eng', hours: 2.0, pct: 20, color: '#10B981' },
    { name: 'General Revision', hours: 1.0, pct: 10, color: '#F59E0B' },
  ];

  return (
    <div className="bento-card flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">Subject Time Breakdown</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">10.0 hrs total</span>
      </div>

      <div className="space-y-3">
        {subjects.map((s) => (
          <div key={s.name} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
              <span className="text-slate-500">{s.hours}h ({s.pct}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
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
        <Target className="h-4 w-4 text-[var(--color-primary)]" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Today's Daily Target
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {completedToday}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            Tasks Completed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            3.5h
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            Focus Time Done
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickLinksCard() {
  const links = [
    { label: 'Set study goals', to: paths.goals, icon: Target },
    { label: 'View analytics report', to: paths.analytics, icon: TrendingUp },
    { label: 'Pomodoro focus timer', to: paths.pomodoro, icon: Clock },
  ];

  return (
    <div className="bento-card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Quick Actions
        </p>
      </div>

      <div className="space-y-1">
        {links.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Icon className="h-4 w-4 flex-none text-[var(--color-primary)]" />
            <span className="flex-1">{label}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
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

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const tasks = tasksData?.content ?? [];
  const totalTasks = tasksData?.totalElements ?? 0;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {getFormattedDate()} · MindSprint Active Workspace
          </p>
        </div>

        <Link
          to={paths.tasks}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <Plus className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          Create New Task
        </Link>
      </motion.div>

      {/* ── Bento Grid Row 1: Key Metrics ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Total Workspace Tasks"
          value={totalTasks}
          icon={CheckCircle2}
          color="#4F46E5"
        />
        <StatCard
          label="Tasks To Do"
          value={todoCount}
          icon={Circle}
          color="#F59E0B"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="#0EA5E9"
        />
        <StreakCard />
      </motion.div>

      {/* ── Bento Grid Row 2: Main Workspace Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* Left 2 Columns: Today's Tasks */}
        <div className="lg:col-span-2 space-y-5">
          <TaskListCard />
          <SubjectDistributionCard />
        </div>

        {/* Right Column: Pomodoro + Stats + Actions */}
        <div className="space-y-5">
          <PomodoroCard />
          <QuickStatsCard />
          <QuickLinksCard />
        </div>
      </motion.div>
    </div>
  );
}
