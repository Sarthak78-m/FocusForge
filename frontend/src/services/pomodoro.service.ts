/**
 * pomodoroService.ts
 *
 * API layer for /api/pomodoro with localStorage fallback.
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { PomodoroSession, PomodoroStats, CreateSessionPayload } from '@/types/pomodoro';

// ── Local storage fallback ───────────────────────────────────────────────

function getStorageKey(): string {
  try {
    const user = localStorage.getItem('mindsprint_mock_user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed?.email) return `mindsprint_pomo_sessions_${parsed.email.toLowerCase()}`;
    }
  } catch {}
  return 'mindsprint_pomo_sessions_default';
}

function getStoredSessions(): PomodoroSession[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSessions(sessions: PomodoroSession[]): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(sessions));
  } catch {}
}

function isNetworkError(err: any): boolean {
  return !err.response || err.response.status === 404 || err.code === 'ERR_NETWORK';
}

// ── Service ──────────────────────────────────────────────────────────────

export const pomodoroService = {
  /** POST /api/pomodoro/sessions — record a completed session */
  async logSession(payload: CreateSessionPayload): Promise<PomodoroSession> {
    try {
      const res = await http.post<ApiResponse<PomodoroSession>>('/pomodoro/sessions', payload);
      const created = unwrapApiResponse(res.data);
      saveStoredSessions([created, ...getStoredSessions()]);
      return created;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const now = new Date().toISOString();
        const local: PomodoroSession = {
          id: Date.now(),
          durationMinutes: payload.durationMinutes,
          sessionType: payload.sessionType,
          taskId: payload.taskId ?? null,
          notes: payload.notes ?? null,
          startedAt: new Date(Date.now() - payload.durationMinutes * 60000).toISOString(),
          endedAt: now,
          createdAt: now,
        };
        saveStoredSessions([local, ...getStoredSessions()]);
        return local;
      }
      throw err;
    }
  },

  /** GET /api/pomodoro/sessions — list all sessions */
  async getSessions(): Promise<PomodoroSession[]> {
    try {
      const res = await http.get<ApiResponse<PomodoroSession[]>>('/pomodoro/sessions');
      const sessions = unwrapApiResponse(res.data);
      if (sessions.length > 0) saveStoredSessions(sessions);
      return sessions;
    } catch (err: any) {
      if (isNetworkError(err)) return getStoredSessions();
      throw err;
    }
  },

  /** GET /api/pomodoro/sessions/stats — aggregated statistics */
  async getStats(): Promise<PomodoroStats> {
    try {
      const res = await http.get<ApiResponse<PomodoroStats>>('/pomodoro/sessions/stats');
      return unwrapApiResponse(res.data);
    } catch (err: any) {
      if (isNetworkError(err)) {
        const sessions = getStoredSessions().filter((s) => s.sessionType === 'WORK');
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = sessions.filter((s) => s.startedAt.startsWith(today));
        return {
          todaySessions: todaySessions.length,
          todayWorkMinutes: todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
          totalWorkMinutes: sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
          totalSessions: sessions.length,
        };
      }
      throw err;
    }
  },
};
