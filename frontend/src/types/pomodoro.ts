// ─── Pomodoro Session Types ───────────────────────────────────────────────────
// Aligned to backend SessionResponse / CreateSessionRequest DTOs

export type PomodoroSessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export type PomodoroSession = {
  id: number;
  durationMinutes: number;
  sessionType: PomodoroSessionType;
  taskId: number | null;
  notes: string | null;
  startedAt: string;
  endedAt: string;
  createdAt: string;
};

export type PomodoroStats = {
  todaySessions: number;
  todayWorkMinutes: number;
  totalWorkMinutes: number;
  totalSessions: number;
};

export type CreateSessionPayload = {
  durationMinutes: number;
  sessionType: PomodoroSessionType;
  taskId?: number | null;
  notes?: string | null;
};
