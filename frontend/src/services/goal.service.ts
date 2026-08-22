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
    const res = await http.get<ApiResponse<PaginatedResponse<any>>>('/goals', {
      params: { page: 0, size: 100 },
    });
    const page = unwrapApiResponse(res.data);
    return page.content.map(mapGoalResponse);
  },

  /** GET /api/goals/active — only non-completed goals */
  async getActiveGoals(): Promise<Goal[]> {
    const res = await http.get<ApiResponse<any[]>>('/goals/active');
    return unwrapApiResponse(res.data).map(mapGoalResponse);
  },

  /** POST /api/goals — create a new goal */
  async createGoal(payload: CreateGoalPayload): Promise<Goal> {
    const res = await http.post<ApiResponse<any>>('/goals', payload);
    return mapGoalResponse(unwrapApiResponse(res.data));
  },

  /** PATCH /api/goals/{id} - complete goal */
  async completeGoal(goalId: number): Promise<Goal> {
    const res = await http.patch<ApiResponse<any>>(`/goals/${goalId}`, {
      status: 'COMPLETED'
    });
    return mapGoalResponse(unwrapApiResponse(res.data));
  },

  /** DELETE /api/goals/{id} */
  async deleteGoal(goalId: number): Promise<void> {
    await http.delete<ApiResponse<void>>(`/goals/${goalId}`);
  },
};

function mapGoalResponse(data: any): Goal {
  return {
    ...data,
    progress: data.progressPercentage || 0,
    status: data.completed ? 'COMPLETED' : 'ACTIVE',
  };
}
