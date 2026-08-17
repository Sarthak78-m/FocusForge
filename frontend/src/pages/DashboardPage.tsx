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
  Hash,
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xs dark:bg-slate-900 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
          style={{ background: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <span className="text-xs font-bold text-emerald-600">{change}</span>
        )}
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-[var(--color-text-secondary)]">
          {label}
        </p>
      </div>
    </div>
  );
}

function StitchPomodoroWidget() {
  const { mode, display, progress, isRunning, sessionCount, start, pause, reset } = usePomodoro();
  const modeLabel = mode === 'work' ? 'Focus Mode' : mode === 'short-break' ? 'Short Break' : 'Long Rest';

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xs dark:bg-slate-900 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--color-primary)]" />
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              Pomodoro Focus Engine
            </p>
          </div>
          <p className="mt-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
            {modeLabel}
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-surface-container)] border border-[var(--color-border-strong)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
          {sessionCount} sessions
        </span>
      </div>

      {/* Timer Display with Ring */}
      <div className="relative mx-auto my-1 flex items-center justify-center">
        <svg width="140" height="140" className="transform -rotate-90">
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="var(--color-surface-secondary)"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {display}
          </p>
          <span className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-0.5 mt-0.5">
            <Flame className="h-3 w-3 fill-[var(--color-primary)]" />
            {isRunning ? 'In Flow' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="flex-1 rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] active:scale-98"
        >
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function StitchTaskListWidget() {
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xs dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            Active Workspace Tasks
          </p>
        </div>
        <Link
          to={paths.tasks}
          className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Quick Add */}
      <form onSubmit={handleAddTask} className="mb-3 flex gap-2">
        <input
          type="text"
          value={newTaskValue}
          onChange={(e) => setNewTaskValue(e.target.value)}
          placeholder="Add a task e.g. Finish growth report #ExamPrep..."
          className="h-9 flex-1 rounded-full border border-[var(--color-border)] bg-slate-50 px-4 text-xs font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none dark:bg-slate-950"
        />
        <button
          type="submit"
          disabled={!newTaskValue.trim()}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
          aria-label="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {/* Task rows */}
      <div className="flex-1 space-y-1.5 overflow-y-auto" style={{ maxHeight: '280px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 flex-1 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-[var(--color-text-secondary)]">
            No tasks yet. Type a task title above to add one!
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800',
                  isCompleted && 'opacity-60 bg-slate-50/60 dark:bg-slate-950/60',
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    disabled={isCompleted}
                    className={cn(
                      'flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all',
                      isCompleted
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-[var(--color-border-strong)] bg-white hover:border-[var(--color-primary)] text-transparent dark:bg-slate-900',
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                  <span
                    className={cn(
                      'truncate text-xs font-semibold',
                      isCompleted
                        ? 'text-[var(--color-text-tertiary)] line-through'
                        : 'text-[var(--color-text-primary)]',
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-none">
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-container)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-primary)]">
                    <Hash className="h-2.5 w-2.5" />
                    ExamPrep
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StitchStreakCard({ tasks = [] }: { tasks?: Task[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const streakDays = completedCount > 0 ? Math.min(7, Math.max(1, completedCount)) : 0;
  const activeDays = days.map((_, idx) => idx < streakDays);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[#E44332] via-[#B31F14] to-[#782D40] p-5 text-white shadow-md">
      <div className="flex flex-col justify-between h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-white/90">Study Streak</p>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            {streakDays > 0 ? '🔥 On Fire' : '🌱 Active'}
          </span>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-white">{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</p>
          <p className="mt-0.5 text-xs text-white/80 font-medium">
            {streakDays > 0 ? 'Active daily learning momentum' : 'Complete tasks to build your streak!'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/20">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-white/70">{d}</span>
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeDays[i]
                    ? 'bg-white text-[#B31F14] shadow-xs'
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

function StitchSubjectBreakdownCard({ tasks = [] }: { tasks?: Task[] }) {
  const subjectMap: Record<string, number> = {};
  tasks.forEach((t) => {
    let subject = 'General Revision';
    const lower = t.title.toLowerCase();
    if (lower.includes('cs') || lower.includes('code') || lower.includes('dev') || lower.includes('computer')) {
      subject = 'Computer Science';
    } else if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra')) {
      subject = 'Mathematics';
    } else if (lower.includes('phys') || lower.includes('eng') || lower.includes('lab')) {
      subject = 'Physics & Eng';
    }
    subjectMap[subject] = (subjectMap[subject] || 0) + 1;
  });

  const totalCount = Object.values(subjectMap).reduce((a, b) => a + b, 0);
  const colors = ['#E44332', '#0058BF', '#006B1D', '#FF7A00'];

  const subjects = Object.entries(subjectMap).map(([name, count], index) => ({
    name,
    count,
    hours: (count * 1.5).toFixed(1),
    pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    color: colors[index % colors.length],
  }));

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xs dark:bg-slate-900 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-sm font-bold text-[var(--color-text-primary)]">Subject Breakdown</p>
        </div>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
          {totalCount > 0 ? `${(totalCount * 1.5).toFixed(1)} hrs total` : '0.0 hrs'}
        </span>
      </div>

      {subjects.length === 0 ? (
        <div className="py-6 text-center text-xs font-medium text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] rounded-xl">
          No tasks logged yet. Add your study tasks above to view subject breakdown!
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--color-text-primary)]">{s.name}</span>
                <span className="text-[var(--color-text-secondary)]">{s.hours}h ({s.pct}%)</span>
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
      )}
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-xs dark:bg-slate-900 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[var(--color-text-secondary)]" />
        <p className="text-sm font-bold text-[var(--color-text-primary)]">
          Quick Actions
        </p>
      </div>

      <div className="space-y-1">
        {links.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-all hover:bg-slate-50 hover:text-[var(--color-text-primary)] dark:hover:bg-slate-800"
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
    <div className="space-y-8 pb-8 font-sans bg-[var(--color-background)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]">
            {getFormattedDate()} · FocusForge Active Workspace
          </p>
        </div>

        <Link
          to={paths.tasks}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Create New Task
        </Link>
      </motion.div>

      {/* Row 1: Key Metrics */}
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
          color="#E44332"
        />
        <StatCard
          label="Tasks To Do"
          value={todoCount}
          icon={Circle}
          color="#FF7A00"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="#0058BF"
        />
        <StitchStreakCard tasks={tasks} />
      </motion.div>

      {/* Row 2: Main Workspace Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* Left 2 Columns: Tasks & Subject Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          <StitchTaskListWidget />
          <StitchSubjectBreakdownCard tasks={tasks} />
        </div>

        {/* Right Column: Pomodoro + Quick Links */}
        <div className="space-y-5">
          <StitchPomodoroWidget />
          <QuickLinksCard />
        </div>
      </motion.div>
    </div>
  );
}
