// ─── Analytics Types ──────────────────────────────────────────────────────────
// Endpoint prefix: /api/analytics

export type SubjectPerformance = {
  subject: string;
  totalStudyMinutes: number;
  completedTasks: number;
  averageQuizScore: number | null;  // null if no quizzes taken
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
};

export type DailyActivityEntry = {
  date: string;           // ISO date YYYY-MM-DD
  studyMinutes: number;
  completedTasks: number;
  pomodoroSessions: number;
  quizzesTaken: number;
};

export type AnalyticsSummary = {
  weeklyStudyMinutes: number;
  weeklyCompletedTasks: number;
  weeklyPomodoroSessions: number;
  monthlyStudyMinutes: number;
  taskCompletionRate: number;       // 0.0 – 1.0
  mostProductiveHour: number;       // 0–23
  mostStudiedSubject: string | null;
  currentStreak: number;
  subjectPerformance: SubjectPerformance[];
  weakSubjects: string[];
  strongSubjects: string[];
  dailyActivity: DailyActivityEntry[];  // last 30 days
};

export type AnalyticsRange = '7d' | '30d' | '90d';
