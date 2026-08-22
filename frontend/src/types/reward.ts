// ─── Reward Types ─────────────────────────────────────────────────────────────
// Aligned to backend endpoints

export type RewardSummary = {
  currentXp: number;
  level: number;
  title: string;
  nextLevelXp: number;
  streakDays: number;
};

export type RewardHistoryItem = {
  id: number;
  eventType: string;
  xpAmount: number;
  createdAt: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  xp?: number;
};
