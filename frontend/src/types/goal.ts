// ─── Goal Types ───────────────────────────────────────────────────────────────
// Endpoint prefix: /api/goals

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export type Goal = {
  id: number;
  title: string;
  description?: string | null;
  targetDate: string;       // ISO date YYYY-MM-DD
  status: GoalStatus;
  progressPercent: number;  // 0–100
  linkedTaskIds: number[];
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalPayload = {
  title: string;
  description?: string;
  targetDate: string;
  linkedTaskIds?: number[];
};

export type UpdateGoalPayload = Partial<Omit<CreateGoalPayload, 'title'>> & {
  title?: string;
  status?: GoalStatus;
  progressPercent?: number;
};
