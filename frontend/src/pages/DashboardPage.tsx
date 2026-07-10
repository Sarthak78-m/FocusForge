import { BarChart3, CheckCircle2, Clock3, Flame, Target, Trophy } from 'lucide-react';
import { ChartCard, EmptyState, StatCard } from '@/components/common';

const stats = [
  { label: "Today's Focus", value: '0h', icon: Clock3, trend: 'No sessions recorded' },
  { label: "Today's Tasks", value: '0', icon: CheckCircle2, trend: 'Ready for planning' },
  { label: 'Weekly Focus', value: '0h', icon: BarChart3, trend: 'Starts after first session' },
  { label: 'Current Streak', value: '0', icon: Flame, trend: 'Build a rhythm' },
  { label: 'Level', value: '1', icon: Trophy, trend: '0 XP earned' },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Your study command center.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Focus Time" description="Study time by day.">
          <EmptyState
            icon={Target}
            title="No focus data yet"
            message="Recorded sessions appear here."
          />
        </ChartCard>
        <ChartCard title="Task Completion" description="Task completion trend.">
          <EmptyState title="No task data yet" message="Completed tasks appear here." />
        </ChartCard>
      </div>
    </div>
  );
}
