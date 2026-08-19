/**
 * pomodoroService.ts
 *
 * API layer for /api/pomodoro
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { PomodoroSession, PomodoroStats, CreateSessionPayload } from '@/types/pomodoro';

export const pomodoroService = {
  /** POST /api/pomodoro/sessions — record a completed session */
  async logSession(payload: CreateSessionPayload): Promise<PomodoroSession> {
    const res = await http.post<ApiResponse<PomodoroSession>>('/pomodoro/sessions', payload);
    return unwrapApiResponse(res.data);
  },

  /** GET /api/pomodoro/sessions — list all sessions */
  async getSessions(): Promise<PomodoroSession[]> {
    const res = await http.get<ApiResponse<PomodoroSession[]>>('/pomodoro/sessions');
    return unwrapApiResponse(res.data);
  },

  /** GET /api/pomodoro/sessions/stats — aggregated statistics */
  async getStats(): Promise<PomodoroStats> {
    const res = await http.get<ApiResponse<PomodoroStats>>('/pomodoro/sessions/stats');
    return unwrapApiResponse(res.data);
  },
};
