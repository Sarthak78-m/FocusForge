// ─── Goal Types ───────────────────────────────────────────────────────────────
// Dynamic categories supported

export const DEFAULT_GOAL_CATEGORIES: string[] = [
  'Exam Prep',
  'Skill Mastery',
  'Daily Habit',
  'Project Milestone',
];

export type Goal = {
  id: number;
  title: string;
  category: string;
  targetDate: string; // YYYY-MM-DD
  currentUnits: number;
  totalUnits: number;
  unitName: string;
  progressPercentage: number; // 0–100
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalPayload = {
  title: string;
  category: string;
  targetDate: string;
  totalUnits: number;
  unitName: string;
};
