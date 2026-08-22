// ─── Pomodoro Session Types ───────────────────────────────────────────────────
// Aligned to backend SessionResponse / CreateSessionRequest DTOs

export type PomodoroSessionType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
export type SessionStatus = 'STARTED' | 'COMPLETED' | 'INTERRUPTED' | 'CANCELLED';

export type PomodoroSession = {
  id: number;
  sessionType: PomodoroSessionType;
  plannedDuration: number;
  actualDuration: number | null;
  taskId: number | null;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
};

export type StartSessionPayload = {
  plannedDuration: number;
  sessionType: PomodoroSessionType;
  taskId?: number | null;
};

export type CompleteSessionPayload = {
  actualDuration: number;
};
