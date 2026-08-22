/**
 * analytics.service.ts
 *
 * API layer for /api/analytics
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { AnalyticsSummary, AnalyticsRange } from '@/types/analytics';

export const analyticsService = {
  /**
   * GET /api/analytics/summary
   * Productivity metrics, focus hours, weekly distribution, and completion rates.
   */
  async getSummary(): Promise<AnalyticsSummary> {
    const response = await http.get<ApiResponse<AnalyticsSummary>>('/analytics/summary');
    return unwrapApiResponse(response.data);
  },
};
