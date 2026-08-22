// ─── Goal Types ───────────────────────────────────────────────────────────────
// Dynamic categories supported

export const DEFAULT_GOAL_CATEGORIES: string[] = [
  'Exam Prep',
  'Skill Mastery',
  'Daily Habit',
  'Project Milestone',
];

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export type Goal = {
  id: number;
  title: string;
  description?: string;
  category: string;
  targetDate: string; // YYYY-MM-DD
  currentUnits: number;
  totalUnits: number;
  unitName: string;
  progressPercentage: number; // Keep for backward compatibility with backend if needed
  progress: number; // 0–100
  completed: boolean; // Keep for backward compatibility
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalPayload = {
  title: string;
  description?: string;
  category: string;
  targetDate: string;
  totalUnits: number;
  unitName: string;
};
