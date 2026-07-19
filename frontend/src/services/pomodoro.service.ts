/**
 * pomodoroService.ts
 *
 * API layer for /api/pomodoro
 *
 * Backend status: NOT YET IMPLEMENTED
 * The frontend Pomodoro timer is currently fully client-side (usePomodoro hook).
 * These service methods will persist sessions server-side once the backend is built.
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  PomodoroSession,
  PomodoroStats,
  LogPomodoroSessionPayload,
  PomodoroSessionType,
} from '@/types/pomodoro';

export type GetSessionsParams = {
  type?: PomodoroSessionType;
  from?: string;   // ISO date YYYY-MM-DD
  to?: string;     // ISO date YYYY-MM-DD
  page?: number;
  size?: number;
};

export const pomodoroService = {
  /**
   * POST /api/pomodoro/sessions
   * Record a completed (or interrupted) Pomodoro session.
   * Call this when the timer ends or the user manually stops.
   */
  async logSession(payload: LogPomodoroSessionPayload) {
    const response = await http.post<ApiResponse<PomodoroSession>>(
      '/pomodoro/sessions',
      payload,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/pomodoro/sessions
   * Paginated session history with optional date-range and type filter.
   */
  async getSessions(params: GetSessionsParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<PomodoroSession>>>(
      '/pomodoro/sessions',
      { params: { ...filters, page, size } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/pomodoro/sessions/stats
   * Aggregated statistics: streaks, today's sessions, weekly total, etc.
   */
  async getStats() {
    const response = await http.get<ApiResponse<PomodoroStats>>('/pomodoro/sessions/stats');
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/pomodoro/sessions/today
   * All sessions for the current calendar day.
   */
  async getTodaySessions() {
    const response = await http.get<ApiResponse<PomodoroSession[]>>(
      '/pomodoro/sessions/today',
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * DELETE /api/pomodoro/sessions/:sessionId
   * Remove a mistakenly logged session.
   */
  async deleteSession(sessionId: number) {
    await http.delete<ApiResponse<void>>(`/pomodoro/sessions/${sessionId}`);
  },
};
