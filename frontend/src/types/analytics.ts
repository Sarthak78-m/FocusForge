// ─── Analytics Types ──────────────────────────────────────────────────────────
// Aligned to backend AnalyticsSummaryResponse DTO

export type DailyFocusMetric = {
  day: string;
  hours: number;
};

export type AnalyticsSummary = {
  totalFocusHours: number;
  completedSessions: number;
  completedTasks: number;
  activeStreakDays: number;
  productivityScore: number;
  weeklyDistribution: DailyFocusMetric[];
  categoryBreakdown: Record<string, number>;
};

export type AnalyticsRange = '7d' | '30d' | '90d';
