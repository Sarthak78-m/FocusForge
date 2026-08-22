import { useState, useMemo } from 'react';
import { Clock, CheckCircle2, BarChart2, Flame, Target } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/utils/cn';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#4073FF', '#E45834', '#FF9A00', '#FF5733', '#9D4EDD', '#2EC4B6'];

export function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useAnalytics();

  // Handle Loading & Error gracefully
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-[var(--color-text-secondary)]">
        <Target className="mb-2 h-8 w-8 text-rose-500" />
        <p className="text-sm font-semibold">Failed to load analytics</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-[var(--color-text-secondary)]">
        <p className="text-sm font-semibold">No data available yet</p>
      </div>
    );
  }

  const {
    totalFocusHours,
    completedSessions,
    completedTasks,
    productivityScore,
    weeklyDistribution,
    categoryBreakdown,
  } = analytics;

  const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  // Mock hourly data for productivity by hour
  const hourlyData = [
    { hour: '9 AM', score: 30 },
    { hour: '11 AM', score: 85 },
    { hour: '1 PM', score: 60 },
    { hour: '3 PM', score: 95 },
    { hour: '5 PM', score: 50 },
    { hour: '7 PM', score: 20 },
  ];

  // Daily focus time chart
  const dailyData = weeklyDistribution.map((item) => ({
    name: item.day,
    hours: item.hours,
  }));

  // Session completion (mock monthly vs completed)
  const sessionData = [
    { name: 'Completed', value: completedSessions },
    { name: 'Remaining Goal', value: Math.max(0, 30 - completedSessions) }, // Example goal 30
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4 font-sans pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Productivity Analytics
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Deep dive into your focus, tasks, and productivity trends
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Focus Time
            </h3>
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {totalFocusHours} <span className="text-lg font-normal text-[var(--color-text-secondary)]">h</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Focus Score
            </h3>
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {productivityScore} <span className="text-lg font-normal text-[var(--color-text-secondary)]">/ 100</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Completed Tasks
            </h3>
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {completedTasks}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Sessions
            </h3>
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            {completedSessions}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Daily Focus Time Chart */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col h-80">
          <h3 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)] mb-4">Daily Focus Time</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip cursor={{ fill: 'var(--color-surface-secondary)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="hours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Task Completion Chart (Category Breakdown) */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col h-80">
          <h3 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)] mb-4">Task Completion by Category</h3>
          <div className="flex-1 min-h-0 flex justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[var(--color-text-tertiary)]">No category data</div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Session Completion Chart */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col h-80">
          <h3 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)] mb-4">Session Goal Progress</h3>
          <div className="flex-1 min-h-0 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sessionData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill="var(--color-primary)" />
                  <Cell fill="var(--color-surface-secondary)" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pb-4 -mt-6">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{completedSessions}</span>
            <p className="text-xs text-[var(--color-text-secondary)]">Sessions Completed</p>
          </div>
        </div>

        {/* 4. Productivity-by-hour chart */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs flex flex-col h-80">
          <h3 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)] mb-4">Productivity by Hour</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                <Line type="monotone" dataKey="score" stroke="#E45834" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
