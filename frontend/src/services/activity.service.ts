/**
 * activity.service.ts
 *
 * API layer for /api/activity — recent user events feed.
 *
 * Backend status: NOT YET IMPLEMENTED
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { ActivityEvent, ActivityEventType } from '@/types/activity';

export type GetActivityParams = {
  type?: ActivityEventType;
  from?: string;    // ISO date-time
  limit?: number;
  page?: number;
  size?: number;
};

export const activityService = {
  /**
   * GET /api/activity
   * Paginated recent activity feed sorted by occurredAt DESC.
   */
  async getActivity(params: GetActivityParams = {}) {
    const { page = 0, size = 20, ...filters } = params;
    const response = await http.get<ApiResponse<PaginatedResponse<ActivityEvent>>>(
      '/activity',
      { params: { ...filters, page, size } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/activity/recent?limit=N
   * The N most recent activity events across all types.
   */
  async getRecentActivity(limit: number = 10) {
    const response = await http.get<ApiResponse<ActivityEvent[]>>('/activity/recent', {
      params: { limit },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/activity/today
   * All events that occurred today.
   */
  async getTodayActivity() {
    const response = await http.get<ApiResponse<ActivityEvent[]>>('/activity/today');
    return unwrapApiResponse(response.data);
  },
};
