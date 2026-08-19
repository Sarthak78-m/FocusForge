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
  Timer,
  FileText,
  BarChart2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore } from '@/store/appStore';
import { useTasks, useCreateTask, useCompleteTask } from '@/hooks/useTasks';
import { usePomodoro } from '@/hooks/usePomodoro';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';
import type { Task, TaskStatus } from '@/types/task';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 22) return 'Good evening';
  return 'Good night';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ══════════════════════════════════════════════════════════
   INTERACTIVE METRIC STAT CARD
   ══════════════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  to,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-[var(--color-primary)] hover:shadow-card-hover transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-xs"
          style={{ background: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors">
          View →
        </span>
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-[var(--color-text-secondary)]">
          {label}
        </p>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   INTERACTIVE POMODORO WIDGET
   ══════════════════════════════════════════════════════════ */
function StitchPomodoroWidget() {
  const { mode, display, progress, isRunning, sessionCount, start, pause, reset } = usePomodoro();
  const modeLabel = mode === 'work' ? 'Focus Mode' : mode === 'short-break' ? 'Short Break' : 'Long Rest';

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col gap-4">
      {/* Header with direct link to Pomodoro page */}
      <div className="flex items-center justify-between">
        <Link
          to={paths.pomodoro}
          className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Clock className="h-4 w-4 text-[var(--color-primary)]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
              Pomodoro Focus Engine
            </p>
            <p className="text-2xs text-[var(--color-text-tertiary)]">{modeLabel}</p>
          </div>
        </Link>
        <Link
          to={paths.pomodoro}
          className="rounded-full bg-[var(--color-surface-container)] border border-[var(--color-border)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)] hover:border-[var(--color-primary)]"
        >
          {sessionCount} sessions
        </Link>
      </div>

      {/* Timer Display with Ring */}
      <Link to={paths.pomodoro} className="relative mx-auto my-1 flex items-center justify-center cursor-pointer group">
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
            strokeWidth={8}
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-mono text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
            {display}
          </p>
          <span className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-0.5 mt-0.5">
            <Flame className="h-3 w-3 fill-[var(--color-primary)]" />
            {isRunning ? 'In Flow' : 'Paused'}
          </span>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="flex-1 h-9 rounded-md bg-[var(--color-primary)] px-4 text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-98 transition-all"
        >
          {isRunning ? 'Pause' : 'Start Focus'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-9 rounded-md border border-[var(--color-border)] px-4 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TASK LIST WIDGET
   ══════════════════════════════════════════════════════════ */
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
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col space-y-3">
      {/* Header with direct link */}
      <div className="flex items-center justify-between">
        <Link
          to={paths.tasks}
          className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
            Active Workspace Tasks
          </p>
        </Link>
        <Link
          to={paths.tasks}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskValue}
          onChange={(e) => setNewTaskValue(e.target.value)}
          placeholder="Add a task (e.g. Complete chapter review)..."
          className="h-8 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-strong)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newTaskValue.trim()}
          className="flex h-8 px-3 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="ml-1">Add</span>
        </button>
      </form>

      {/* Task rows */}
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md px-2 py-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--color-surface-secondary)]" />
              <div className="h-3 flex-1 animate-pulse rounded bg-[var(--color-surface-secondary)]" />
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)] rounded-md">
            No tasks yet. Type above to create your first task!
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-md border border-[var(--color-border)] p-2.5 transition-colors hover:bg-[var(--color-surface-secondary)]',
                  isCompleted && 'opacity-60 bg-[var(--color-surface-secondary)]/50'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    disabled={isCompleted}
                    className={cn(
                      'flex h-4.5 w-4.5 flex-none items-center justify-center rounded-full border transition-all',
                      isCompleted
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                        : 'border-[#999999] hover:border-[var(--color-primary)] text-transparent'
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                  </button>
                  <span
                    className={cn(
                      'truncate text-xs font-medium',
                      isCompleted ? 'text-[var(--color-text-tertiary)] line-through' : 'text-[var(--color-text-primary)]'
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                {task.priority && (
                  <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--color-surface-container)] border border-[var(--color-border)]">
                    {task.priority}
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

/* ══════════════════════════════════════════════════════════
   STREAK CARD
   ══════════════════════════════════════════════════════════ */
function StitchStreakCard({ tasks = [] }: { tasks?: Task[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const streakDays = completedCount > 0 ? Math.min(7, Math.max(1, completedCount)) : 0;
  const activeDays = days.map((_, idx) => idx < streakDays);

  return (
    <Link
      to={paths.rewards}
      className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-[var(--color-primary)] hover:shadow-card-hover transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
            Productivity Streak
          </p>
        </div>
        <span className="text-xs text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors">
          Milestones →
        </span>
      </div>

      <div>
        <p className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {streakDays > 0 ? 'Active daily streak' : 'Complete tasks to build your streak!'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-[var(--color-text-tertiary)]">{d}</span>
            <div
              className={cn(
                'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                activeDays[i]
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]'
              )}
            >
              {activeDays[i] ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   SUBJECT BREAKDOWN CARD
   ══════════════════════════════════════════════════════════ */
function StitchSubjectBreakdownCard({ tasks = [] }: { tasks?: Task[] }) {
  const subjectMap: Record<string, number> = {};

  tasks.forEach((t) => {
    const tagMatch = t.title.match(/#(\w+)/);
    const subject = tagMatch ? `#${tagMatch[1]}` : 'General Study';
    subjectMap[subject] = (subjectMap[subject] || 0) + 1;
  });

  const totalCount = Object.values(subjectMap).reduce((a, b) => a + b, 0);

  const subjects = Object.entries(subjectMap).map(([name, count]) => ({
    name,
    count,
    pct: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
  }));

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          to={paths.tasks}
          className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
            Task Categories
          </p>
        </Link>
        <span className="text-2xs font-semibold text-[var(--color-text-secondary)]">
          {totalCount} Total Task{totalCount !== 1 ? 's' : ''}
        </span>
      </div>

      {subjects.length === 0 ? (
        <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)] border border-dashed border-[var(--color-border)] rounded-lg">
          No tasks added yet. Create tasks to view breakdown.
        </div>
      ) : (
        <div className="space-y-2.5">
          {subjects.map((s) => (
            <Link
              key={s.name}
              to={paths.tasks}
              className="block space-y-1 hover:opacity-80 transition-opacity"
            >
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[var(--color-text-primary)]">{s.name}</span>
                <span className="text-[var(--color-text-secondary)]">{s.count} tasks ({s.pct}%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-secondary)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   QUICK LINKS CARD
   ══════════════════════════════════════════════════════════ */
function QuickLinksCard() {
  const links = [
    { label: 'Notes & Productivity Notebook', to: paths.notes, icon: FileText },
    { label: 'Pomodoro Interval Timer', to: paths.pomodoro, icon: Timer },
    { label: 'Productivity Analytics', to: paths.analytics, icon: BarChart2 },
    { label: 'Rewards & Milestones', to: paths.rewards, icon: Target },
  ];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Quick Navigation
      </p>

      <div className="space-y-1">
        {links.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Icon className="h-4 w-4 flex-none text-[var(--color-primary)]" />
            <span className="flex-1">{label}</span>
            <ArrowRight className="h-3 w-3 opacity-50" />
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
  const openCreateTaskModal = useAppStore((s) => s.openCreateTaskModal);
  const { data: tasksData } = useTasks({ size: 100 });

  // Resolve actual user name cleanly
  const rawName = user?.name?.trim() || '';
  let displayName = rawName;
  if (!displayName || displayName.includes('@')) {
    try {
      const stored = localStorage.getItem('mindsprint_mock_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name && !parsed.name.includes('@')) {
          displayName = parsed.name;
        }
      }
    } catch {}
  }
  const firstName = displayName ? displayName.split(' ')[0] : 'user';
  const tasks = tasksData?.content ?? [];
  const totalTasks = tasksData?.totalElements ?? 0;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {getFormattedDate()} · MindSprint Active Workspace
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateTaskModal}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-[var(--color-primary)] text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create New Task</span>
        </button>
      </motion.div>

      {/* Row 1: Key Metrics - All clickable & link to respective pages */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Total Workspace Tasks"
          value={totalTasks}
          icon={CheckCircle2}
          color="#E45834"
          to={paths.tasks}
        />
        <StatCard
          label="Tasks To Do"
          value={todoCount}
          icon={Circle}
          color="#FF9A00"
          to={paths.tasks}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="#4073FF"
          to={paths.tasks}
        />
        <StitchStreakCard tasks={tasks} />
      </motion.div>

      {/* Row 2: Main Workspace Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        {/* Left 2 Columns: Tasks & Subject Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <StitchTaskListWidget />
          <StitchSubjectBreakdownCard tasks={tasks} />
        </div>

        {/* Right Column: Pomodoro + Quick Links */}
        <div className="space-y-4">
          <StitchPomodoroWidget />
          <QuickLinksCard />
        </div>
      </motion.div>
    </div>
  );
}
