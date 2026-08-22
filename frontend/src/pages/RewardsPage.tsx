import { useRewardSummary, useRewardHistory, useRewardAchievements } from '@/hooks/useRewards';
import { Flame, CheckCircle2, Lock, History } from 'lucide-react';
import { motion } from 'framer-motion';

export function RewardsPage() {
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useRewardSummary();
  const { data: history, isLoading: isHistoryLoading, error: historyError } = useRewardHistory();
  const { data: achievements, isLoading: isAchievementsLoading, error: achievementsError } = useRewardAchievements();

  const isLoading = isSummaryLoading || isHistoryLoading || isAchievementsLoading;
  const error = summaryError || historyError || achievementsError;

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading rewards...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load rewards data.</div>;
  }

  const xp = summary?.currentXp ?? 0;
  const currentLevel = summary?.level ?? 1;
  const nextLevelXp = summary?.nextLevelXp ?? 100;
  const levelProgress = Math.min(100, Math.max(0, Math.round((xp / nextLevelXp) * 100)));

  const badges = achievements ?? [];
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const historyItems = history ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Productivity Milestones
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Track your work consistency and milestone progress
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
          <Flame className="h-4 w-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
          <span>{summary?.streakDays ?? 0} Day Streak</span>
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
                {summary?.title ?? 'Novice'}
              </h2>
            </div>
          </div>

          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)]">
              <span>Next Level Progress</span>
              <span>{xp} / {nextLevelXp} XP</span>
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

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Recent Activity
          </h2>
        </div>
        
        {historyItems.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center text-sm text-[var(--color-text-secondary)]">
            No recent activity
          </div>
        ) : (
          <div className="space-y-2">
            {historyItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-[var(--color-primary)]">+{item.xpAmount} XP</span>
                  <span className="text-[var(--color-text-primary)]">{item.eventType}</span>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
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
                {badge.xp && (
                  <span className="rounded px-2 py-0.5 text-2xs font-bold bg-[var(--color-surface-container)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    +{badge.xp} XP
                  </span>
                )}
              </div>

              <h3 className="mt-2.5 text-xs font-semibold text-[var(--color-text-primary)]">
                {badge.name}
              </h3>
              <p className="mt-0.5 text-2xs text-[var(--color-text-secondary)]">{badge.description}</p>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[var(--color-border)] text-2xs font-medium text-[var(--color-text-tertiary)]">
                <span>{badge.unlocked ? `Achieved ${badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : ''}` : 'Locked'}</span>
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
