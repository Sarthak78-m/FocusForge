import { useState } from 'react';
import { Clock, Zap, CheckCircle2, Award, Flame, BarChart2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const weeklyData = [
    { day: 'Mon', hours: 3.5, percent: 58 },
    { day: 'Tue', hours: 4.2, percent: 70 },
    { day: 'Wed', hours: 2.8, percent: 46 },
    { day: 'Thu', hours: 5.0, percent: 83 },
    { day: 'Fri', hours: 4.5, percent: 75 },
    { day: 'Sat', hours: 1.5, percent: 25 },
    { day: 'Sun', hours: 3.0, percent: 50 },
  ];

  return (
    <div className="mx-auto max-w-[800px] space-y-8 py-4">
      {/* Page Header & Timeframe Toggle (Stitch Analytics Header) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Analytics
          </h1>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">
            Your productivity & cognitive focus overview.
          </p>
        </div>

        {/* Stitch Pill Timeframe Selector */}
        <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-white p-1 shadow-xs dark:bg-slate-900">
          {(['week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={cn(
                'rounded-md px-4 py-1.5 text-xs font-bold capitalize transition-all',
                timeframe === t
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stitch Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Focus Goal Progress Ring */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xs dark:bg-slate-900">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Daily Focus Goal</h3>
            <Clock className="h-4 w-4 text-[var(--color-accent)]" />
          </div>

          <div className="relative h-44 w-44 my-2 flex items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="text-[var(--color-surface-secondary)]"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-[var(--color-primary)] stroke-current"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">
                4.5<span className="text-base font-normal text-[var(--color-text-secondary)]">h</span>
              </span>
              <span className="text-[11px] font-bold text-[var(--color-text-tertiary)] mt-0.5">
                of 6h Goal
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-2">
            75% of your daily goal achieved today
          </p>
        </div>

        {/* Productivity Score & Streak Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xs dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Productivity Score</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Based on streak & tasks completed</p>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">94</span>
            <span className="text-xs font-bold text-emerald-600">Top 5% Learner</span>
          </div>

          <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                Active Streak
              </span>
              <span className="font-bold text-[var(--color-text-primary)]">7 Days</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                Task Completion Rate
              </span>
              <span className="font-bold text-emerald-600">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Time Trend Bar Chart (Stitch Design System) */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xs dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Focus Hours Trend
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">Daily breakdown across all projects</p>
          </div>
          <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-3 py-1 rounded-full">
            Avg 3.5h / day
          </span>
        </div>

        <div className="flex h-48 items-end justify-between gap-3 pt-4">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">
                {d.hours}h
              </span>
              <div className="w-full max-w-[36px] rounded-xl bg-slate-100 dark:bg-slate-800 h-full flex items-end overflow-hidden">
                <div
                  className="w-full rounded-xl bg-[var(--color-primary)] transition-all duration-500 hover:bg-[var(--color-primary-hover)]"
                  style={{ height: `${d.percent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Distribution Breakdown */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xs dark:bg-slate-900">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-[var(--color-primary)]" />
          Focus Time by Project
        </h3>

        <div className="space-y-4">
          {[
            { name: 'ExamPrep', percent: 45, hours: '11h', color: '#E44332' },
            { name: 'WebsiteUpdate', percent: 25, hours: '6h', color: '#FF7A00' },
            { name: 'Fitness', percent: 20, hours: '5h', color: '#006B1D' },
            { name: 'Appointments', percent: 10, hours: '2.5h', color: '#0058BF' },
          ].map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--color-text-primary)]">#{item.name}</span>
                <span className="text-[var(--color-text-secondary)]">{item.hours} ({item.percent}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
