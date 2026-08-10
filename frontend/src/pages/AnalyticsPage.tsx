import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, Zap, CheckCircle2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export function AnalyticsPage() {
  const { activePalette } = useTheme();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const weeklyData = [
    { day: 'Mon', hours: 3.5, sessions: 7 },
    { day: 'Tue', hours: 4.2, sessions: 8 },
    { day: 'Wed', hours: 2.8, sessions: 5 },
    { day: 'Thu', hours: 5.0, sessions: 10 },
    { day: 'Fri', hours: 4.5, sessions: 9 },
    { day: 'Sat', hours: 1.5, sessions: 3 },
    { day: 'Sun', hours: 3.0, sessions: 6 },
  ];

  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Study Analytics & Insights
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <TrendingUp className="mr-1 inline h-3.5 w-3.5" />
              Toggl-Style Time Tracking
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gain deep visibility into your learning velocity, focus hours, and study habits
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 rounded-full border border-slate-200/90 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {(['week', 'month', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${
                timeframe === t
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">+12% vs last week</span>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">24.5 hrs</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">Total Focus Time</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Peak 9 AM - 12 PM</span>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">48 Sprints</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">Pomodoros Completed</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">92% Completion Rate</span>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">18 Tasks</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">Tasks Completed</p>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-purple-600">Top 5% Learner</span>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">94 / 100</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">Productivity Score</p>
        </div>
      </div>

      {/* Main Focus Time Bar Chart */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Focus Hours Breakdown
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Daily hours logged across all subjects</p>
          </div>
          <span className="text-xs font-bold text-slate-500">Avg 3.5h / day</span>
        </div>

        {/* Custom SVG/HTML Bar Chart */}
        <div className="mt-8 flex h-52 items-end justify-between gap-3 pt-6">
          {weeklyData.map((d) => {
            const heightPct = Math.round((d.hours / maxHours) * 100);
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {d.hours}h
                </span>

                <div className="w-full max-w-[48px] rounded-2xl bg-slate-100 dark:bg-slate-800 h-full flex items-end overflow-hidden">
                  <div
                    className="w-full rounded-2xl transition-all duration-700"
                    style={{
                      height: `${heightPct}%`,
                      background: activePalette.gradient,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
