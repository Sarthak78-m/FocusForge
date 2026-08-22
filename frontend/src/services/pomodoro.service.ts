/**
 * pomodoroService.ts
 *
 * API layer for /api/pomodoro
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { PomodoroSession, StartSessionPayload, CompleteSessionPayload } from '@/types/pomodoro';

export const pomodoroService = {
  async startSession(payload: StartSessionPayload): Promise<PomodoroSession> {
    const res = await http.post<ApiResponse<PomodoroSession>>('/pomodoro/sessions/start', payload);
    return unwrapApiResponse(res.data);
  },

  async completeSession(id: number, payload: CompleteSessionPayload): Promise<PomodoroSession> {
    const res = await http.post<ApiResponse<PomodoroSession>>(`/pomodoro/sessions/${id}/complete`, payload);
    return unwrapApiResponse(res.data);
  },

  async interruptSession(id: number, payload: CompleteSessionPayload): Promise<PomodoroSession> {
    const res = await http.post<ApiResponse<PomodoroSession>>(`/pomodoro/sessions/${id}/interrupt`, payload);
    return unwrapApiResponse(res.data);
  },

  async getSessions(): Promise<PomodoroSession[]> {
    const res = await http.get<ApiResponse<PomodoroSession[]>>('/pomodoro/sessions');
    return unwrapApiResponse(res.data);
  },

  async getTodaySessions(): Promise<PomodoroSession[]> {
    const res = await http.get<ApiResponse<PomodoroSession[]>>('/pomodoro/sessions/today');
    return unwrapApiResponse(res.data);
  },

  async getActiveSession(): Promise<PomodoroSession | null> {
    const res = await http.get<ApiResponse<PomodoroSession | null>>('/pomodoro/sessions/active');
    return unwrapApiResponse(res.data);
  },
};
