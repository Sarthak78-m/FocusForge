import { useTasks } from '@/hooks/useTasks';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useRewards } from '@/hooks/useRewards';
import { Flame, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function RewardsPage() {
  const { data: serverRewards, isLoading } = useRewards();
  const { data: tasksData } = useTasks({ size: 100 });
  const { sessionCount } = usePomodoro();

  const tasks = tasksData?.content ?? [];
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  // Compute fallback if backend data is not yet loaded
  const fallbackXp = completedTasks * 50 + sessionCount * 100;
  const fallbackLevel = Math.floor(fallbackXp / 500) + 1;
  const xp = serverRewards?.currentXp ?? fallbackXp;
  const currentLevel = serverRewards?.level ?? fallbackLevel;
  const levelProgress = Math.round(((xp % 500) / 500) * 100);

  const badges = serverRewards?.badges && serverRewards.badges.length > 0
    ? serverRewards.badges.map((b) => ({
        id: b.id,
        title: b.name,
        description: b.description,
        icon: b.icon,
        unlocked: b.unlocked,
        xp: 50,
      }))
    : [
        {
          id: '1',
          title: 'First Sprint Champion',
          description: 'Complete your first Pomodoro focus sprint',
          icon: '⚡',
          unlocked: sessionCount >= 1,
          xp: 50,
        },
        {
          id: '2',
          title: 'Task Completer',
          description: 'Complete at least 5 study tasks',
          icon: '✓',
          unlocked: completedTasks >= 5,
          xp: 150,
        },
        {
          id: '3',
          title: 'Focus Sprint Master',
          description: 'Complete 4 deep work focus sessions',
          icon: '⏱️',
          unlocked: sessionCount >= 4,
          xp: 200,
        },
        {
          id: '4',
          title: 'Task Crusher',
          description: 'Complete 15 study tasks in your workspace',
          icon: '🎯',
          unlocked: completedTasks >= 15,
          xp: 300,
        },
        {
          id: '5',
          title: 'Deep Work Champion',
          description: 'Complete 10 total Pomodoro focus sessions',
          icon: '🏆',
          unlocked: sessionCount >= 10,
          xp: 500,
        },
      ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Productivity Milestones
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Track your study consistency and milestone progress
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
          <Flame className="h-4 w-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
          <span>{serverRewards?.streakDays ?? sessionCount} Focus Sprints Completed</span>
        </div>
      </div>

      {/* Level Banner Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-surface-secondary)] text-xl border border-[var(--color-border)]">
              🏆
            </div>
            <div>
              <span className="rounded px-2 py-0.5 text-2xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                Level {currentLevel}
              </span>
              <h2 className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
                {xp} Total Study Points
              </h2>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)]">
              <span>Next Level Progress</span>
              <span>{xp % 500} / 500 XP</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--color-surface-secondary)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Badges Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
          Milestones ({unlockedCount} of {badges.length} Achieved)
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-4 transition-all ${
                badge.unlocked
                  ? 'border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{badge.icon}</span>
                <span className="rounded px-2 py-0.5 text-2xs font-bold bg-[var(--color-surface-container)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  +{badge.xp} XP
                </span>
              </div>

              <h3 className="mt-2.5 text-xs font-semibold text-[var(--color-text-primary)]">
                {badge.title}
              </h3>
              <p className="mt-0.5 text-2xs text-[var(--color-text-secondary)]">{badge.description}</p>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[var(--color-border)] text-2xs font-medium text-[var(--color-text-tertiary)]">
                <span>{badge.unlocked ? 'Achieved' : 'In Progress'}</span>
                {badge.unlocked ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
