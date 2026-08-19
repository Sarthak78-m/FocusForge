/**
 * goalService.ts
 *
 * API layer for /api/goals
 * Matches backend endpoints: GoalController.java
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Goal, CreateGoalPayload } from '@/types/goal';

export const goalService = {
  /** GET /api/goals — paginated list of all goals */
  async getGoals(): Promise<Goal[]> {
    const res = await http.get<ApiResponse<PaginatedResponse<Goal>>>('/goals', {
      params: { page: 0, size: 100 },
    });
    const page = unwrapApiResponse(res.data);
    return page.content;
  },

  /** GET /api/goals/active — only non-completed goals */
  async getActiveGoals(): Promise<Goal[]> {
    const res = await http.get<ApiResponse<Goal[]>>('/goals/active');
    return unwrapApiResponse(res.data);
  },

  /** POST /api/goals — create a new goal */
  async createGoal(payload: CreateGoalPayload): Promise<Goal> {
    const res = await http.post<ApiResponse<Goal>>('/goals', payload);
    return unwrapApiResponse(res.data);
  },

  /** PATCH /api/goals/{id}/progress?units=N — increment progress */
  async incrementProgress(goalId: number, units: number = 1): Promise<Goal> {
    const res = await http.patch<ApiResponse<Goal>>(`/goals/${goalId}/progress`, null, {
      params: { units },
    });
    return unwrapApiResponse(res.data);
  },

  /** DELETE /api/goals/{id} */
  async deleteGoal(goalId: number): Promise<void> {
    await http.delete<ApiResponse<void>>(`/goals/${goalId}`);
  },
};
