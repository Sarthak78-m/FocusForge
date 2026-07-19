// ─── Pomodoro Session Types ───────────────────────────────────────────────────
// Endpoint prefix: /api/pomodoro/sessions

export type PomodoroSessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export type PomodoroSession = {
  id: number;
  type: PomodoroSessionType;
  durationMinutes: number;   // actual duration (may differ from target if stopped early)
  completed: boolean;
  linkedTaskId?: number | null;
  startedAt: string;
  endedAt: string;
};

export type PomodoroStats = {
  totalSessions: number;
  totalWorkMinutes: number;
  completedWorkSessions: number;
  currentStreak: number;      // consecutive days with ≥1 work session
  longestStreak: number;
  todaySessions: number;
  todayWorkMinutes: number;
};

export type LogPomodoroSessionPayload = {
  type: PomodoroSessionType;
  durationMinutes: number;
  completed: boolean;
  linkedTaskId?: number;
  startedAt: string;
  endedAt: string;
};
