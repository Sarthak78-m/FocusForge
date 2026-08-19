import { useState } from 'react';
import { Clock, CheckCircle2, BarChart2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePomodoroStats } from '@/hooks/usePomodoroSessions';
import { cn } from '@/utils/cn';

export function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const { data: analytics } = useAnalytics('30d');
  const { data: pomodoroStats } = usePomodoroStats();
  const { data: tasksData } = useTasks({ size: 100 });
  const { sessionCount } = usePomodoro();

  const tasks = tasksData?.content ?? [];
  const totalTasks = tasks.length;
  const completedTasks = analytics?.completedTasks ?? tasks.filter((t) => t.status === 'COMPLETED').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (analytics?.productivityScore ?? 0);

  // Real focus session tracking
  const totalSessions = pomodoroStats?.totalSessions ?? (analytics?.completedSessions ?? sessionCount);
  const totalMinutes = pomodoroStats?.totalWorkMinutes ?? (totalSessions * 25);
  const focusHours = (totalMinutes / 60).toFixed(1);
  const goalHours = 4.0;
  const todayMinutes = pomodoroStats?.todayWorkMinutes ?? (sessionCount * 25);
  const todayHours = (todayMinutes / 60).toFixed(1);
  const goalPercent = Math.min(100, Math.round((parseFloat(todayHours) / goalHours) * 100));

  // Weekly distribution from backend
  const weeklyDistribution = analytics?.weeklyDistribution ?? [];
  const currentDayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  const dailyData = weeklyDistribution.length > 0
    ? weeklyDistribution.map((item) => ({
        day: item.day,
        hours: item.hours,
        percent: Math.min(100, Math.round((item.hours / goalHours) * 100)),
        isToday: item.day === currentDayLabel,
      }))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
        const isToday = day === currentDayLabel;
        const hours = isToday ? parseFloat(todayHours) : 0;
        return {
          day,
          hours,
          percent: Math.min(100, Math.round((hours / goalHours) * 100)),
          isToday,
        };
      });

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Productivity Analytics
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Real-time tracking of your tasks, completed focus sprints, and consistency
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 shadow-xs">
          {(['week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={cn(
                'rounded-md px-3.5 py-1 text-xs font-semibold capitalize transition-colors',
                timeframe === t
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Focus Goal Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--color-primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Daily Focus Goal
              </h3>
            </div>
            <span className="text-2xs font-semibold text-[var(--color-text-secondary)]">Target: {goalHours}h</span>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">
              {todayHours}<span className="text-lg font-normal text-[var(--color-text-secondary)]">h</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {totalSessions} Focus Sprint{totalSessions !== 1 ? 's' : ''} recorded ({totalMinutes} mins total)
            </p>
            <div className="w-full max-w-xs mt-4">
              <div className="h-2 w-full rounded-full bg-[var(--color-surface-secondary)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <p className="text-2xs text-[var(--color-text-tertiary)] mt-1 text-right">{goalPercent}% of daily goal</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] text-2xs text-[var(--color-text-tertiary)]">
            Start a Pomodoro timer in Focus Timer to log focus hours.
          </div>
        </div>

        {/* Task Completion Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Task Completion
              </h3>
            </div>
            <span className="text-2xs font-semibold text-[var(--color-text-secondary)]">
              {completedTasks} of {totalTasks} Tasks
            </span>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              {completionRate}<span className="text-lg font-normal text-[var(--color-text-secondary)]">%</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Overall Workspace Completion Rate
            </p>
            <div className="w-full max-w-xs mt-4">
              <div className="h-2 w-full rounded-full bg-[var(--color-surface-secondary)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-2xs text-[var(--color-text-tertiary)] mt-1 text-right">
                {totalTasks - completedTasks} task{totalTasks - completedTasks !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-2xs text-[var(--color-text-tertiary)]">
            <span>Completed: {completedTasks}</span>
            <span>Pending: {totalTasks - completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Focus Hours Trend Chart */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Focus Hours Trend
            </h3>
          </div>
          <span className="text-2xs font-semibold text-[var(--color-text-secondary)]">
            Logged: {focusHours} hrs total
          </span>
        </div>

        <div className="pt-4">
          <div className="flex items-end justify-between gap-2 h-44 px-2">
            {dailyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-2xs font-medium text-[var(--color-text-secondary)]">
                  {d.hours > 0 ? `${d.hours}h` : '—'}
                </span>
                <div className="w-full max-w-[36px] h-32 rounded-md bg-[var(--color-surface-secondary)] relative overflow-hidden flex items-end">
                  <div
                    className={cn(
                      'w-full rounded-md transition-all duration-500',
                      d.isToday ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-primary)]/40'
                    )}
                    style={{ height: d.hours > 0 ? `${Math.max(12, d.percent)}%` : '4px' }}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    d.isToday ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-tertiary)]'
                  )}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
