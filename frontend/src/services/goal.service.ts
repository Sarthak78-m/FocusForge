/**
 * goalService.ts
 *
 * API layer for /api/goals
 *
 * Backend status: NOT YET IMPLEMENTED
 * These calls will return 404 until the Goal domain is added to Spring Boot.
 * All method signatures, payload shapes, and response types are defined
 * contract-first to match the intended backend design.
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Goal, CreateGoalPayload, UpdateGoalPayload, GoalStatus } from '@/types/goal';

export type GetGoalsParams = {
  status?: GoalStatus;
  page?: number;
  size?: number;
};

export const goalService = {
  /**
   * GET /api/goals
   * List all goals for the authenticated user with optional status filter.
   */
  async getGoals(params: GetGoalsParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<Goal>>>('/goals', {
      params: { ...filters, page, size },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/goals/:goalId
   */
  async getGoal(goalId: number) {
    const response = await http.get<ApiResponse<Goal>>(`/goals/${goalId}`);
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/goals/active
   * Shortcut — returns only ACTIVE goals unpaginated for dashboard/context use.
   */
  async getActiveGoals() {
    const response = await http.get<ApiResponse<Goal[]>>('/goals/active');
    return unwrapApiResponse(response.data);
  },

  /**
   * POST /api/goals
   */
  async createGoal(payload: CreateGoalPayload) {
    const response = await http.post<ApiResponse<Goal>>('/goals', payload);
    return unwrapApiResponse(response.data);
  },

  /**
   * PUT /api/goals/:goalId
   */
  async updateGoal(goalId: number, payload: UpdateGoalPayload) {
    const response = await http.put<ApiResponse<Goal>>(`/goals/${goalId}`, payload);
    return unwrapApiResponse(response.data);
  },

  /**
   * PATCH /api/goals/:goalId/progress
   * Update only the progressPercent field.
   */
  async updateProgress(goalId: number, progressPercent: number) {
    const response = await http.patch<ApiResponse<Goal>>(`/goals/${goalId}/progress`, {
      progressPercent,
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * PATCH /api/goals/:goalId/complete
   * Mark a goal as COMPLETED.
   */
  async completeGoal(goalId: number) {
    const response = await http.patch<ApiResponse<Goal>>(`/goals/${goalId}/complete`);
    return unwrapApiResponse(response.data);
  },

  /**
   * DELETE /api/goals/:goalId
   */
  async deleteGoal(goalId: number) {
    await http.delete<ApiResponse<void>>(`/goals/${goalId}`);
  },
};
