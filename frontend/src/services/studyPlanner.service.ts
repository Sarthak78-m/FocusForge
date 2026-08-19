/**
 * studyPlannerService.ts
 *
 * API layer for /api/study-planner and /api/deadlines
 *
 * Backend status: NOT YET IMPLEMENTED
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  StudyBlock,
  StudyPlan,
  CreateStudyBlockPayload,
  UpdateStudyBlockPayload,
  StudyBlockStatus,
  Deadline,
} from '@/types/studyPlanner';

// ─── Productivity Blocks ─────────────────────────────────────────────────────────────

export type GetStudyBlocksParams = {
  from?: string;    // ISO date YYYY-MM-DD
  to?: string;
  subject?: string;
  status?: StudyBlockStatus;
  page?: number;
  size?: number;
};

export const studyPlannerService = {
  /**
   * GET /api/study-planner/blocks
   * List work blocks with optional date-range, subject, and status filters.
   */
  async getBlocks(params: GetStudyBlocksParams = {}) {
    const { page = 0, size = 50, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<StudyBlock>>>(
      '/study-planner/blocks',
      { params: { ...filters, page, size } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/study-planner/week?weekStart=YYYY-MM-DD
   * Fetch the full weekly plan (all blocks for a given ISO-Monday week).
   */
  async getWeeklyPlan(weekStartDate: string) {
    const response = await http.get<ApiResponse<StudyPlan>>('/study-planner/week', {
      params: { weekStart: weekStartDate },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/study-planner/today
   * Productivity blocks scheduled for today.
   */
  async getTodayBlocks() {
    const response = await http.get<ApiResponse<StudyBlock[]>>('/study-planner/today');
    return unwrapApiResponse(response.data);
  },

  /**
   * POST /api/study-planner/blocks
   */
  async createBlock(payload: CreateStudyBlockPayload) {
    const response = await http.post<ApiResponse<StudyBlock>>(
      '/study-planner/blocks',
      payload,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * PUT /api/study-planner/blocks/:blockId
   */
  async updateBlock(blockId: number, payload: UpdateStudyBlockPayload) {
    const response = await http.put<ApiResponse<StudyBlock>>(
      `/study-planner/blocks/${blockId}`,
      payload,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * PATCH /api/study-planner/blocks/:blockId/complete
   */
  async completeBlock(blockId: number) {
    const response = await http.patch<ApiResponse<StudyBlock>>(
      `/study-planner/blocks/${blockId}/complete`,
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * DELETE /api/study-planner/blocks/:blockId
   */
  async deleteBlock(blockId: number) {
    await http.delete<ApiResponse<void>>(`/study-planner/blocks/${blockId}`);
  },
};

// ─── Deadlines ────────────────────────────────────────────────────────────────

export type GetDeadlinesParams = {
  upcoming?: boolean;   // only deadlines in the future
  urgent?: boolean;     // only deadlines within 48h
  subject?: string;
  page?: number;
  size?: number;
};

export const deadlineService = {
  /**
   * GET /api/deadlines
   */
  async getDeadlines(params: GetDeadlinesParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<Deadline>>>(
      '/deadlines',
      { params: { ...filters, page, size } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/deadlines/upcoming
   * All future deadlines sorted by dueDate ASC.
   */
  async getUpcoming() {
    const response = await http.get<ApiResponse<Deadline[]>>('/deadlines/upcoming');
    return unwrapApiResponse(response.data);
  },

  /**
   * POST /api/deadlines
   */
  async createDeadline(payload: Omit<Deadline, 'id' | 'urgent'>) {
    const response = await http.post<ApiResponse<Deadline>>('/deadlines', payload);
    return unwrapApiResponse(response.data);
  },

  /**
   * DELETE /api/deadlines/:deadlineId
   */
  async deleteDeadline(deadlineId: number) {
    await http.delete<ApiResponse<void>>(`/deadlines/${deadlineId}`);
  },
};
