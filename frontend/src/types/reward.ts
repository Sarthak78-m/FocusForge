// ─── Reward Types ─────────────────────────────────────────────────────────────
// Aligned to backend RewardSummaryResponse DTO

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type RewardSummary = {
  currentXp: number;
  level: number;
  title: string;
  nextLevelXp: number;
  streakDays: number;
  badges: Badge[];
};
