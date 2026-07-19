/**
 * analyticsService.ts
 *
 * API layer for /api/analytics
 *
 * Backend status: NOT YET IMPLEMENTED
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { AnalyticsSummary, AnalyticsRange, SubjectPerformance, DailyActivityEntry } from '@/types/analytics';

export const analyticsService = {
  /**
   * GET /api/analytics/summary?range=7d|30d|90d
   * Full analytics summary including weak/strong subjects, daily activity,
   * and productivity metrics.
   */
  async getSummary(range: AnalyticsRange = '30d') {
    const response = await http.get<ApiResponse<AnalyticsSummary>>('/analytics/summary', {
      params: { range },
    });
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/analytics/subjects
   * Per-subject performance breakdown.
   */
  async getSubjectPerformance() {
    const response = await http.get<ApiResponse<SubjectPerformance[]>>(
      '/analytics/subjects',
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/analytics/subjects/weak
   * Returns subjects classified as WEAK (below threshold score/study time).
   */
  async getWeakSubjects() {
    const response = await http.get<ApiResponse<SubjectPerformance[]>>(
      '/analytics/subjects/weak',
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/analytics/subjects/strong
   * Returns subjects classified as STRONG.
   */
  async getStrongSubjects() {
    const response = await http.get<ApiResponse<SubjectPerformance[]>>(
      '/analytics/subjects/strong',
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/analytics/activity?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Daily activity entries for chart rendering.
   */
  async getDailyActivity(from: string, to: string) {
    const response = await http.get<ApiResponse<DailyActivityEntry[]>>(
      '/analytics/activity',
      { params: { from, to } },
    );
    return unwrapApiResponse(response.data);
  },

  /**
   * GET /api/analytics/heatmap?year=YYYY
   * GitHub-style activity heatmap data (date → minutes studied).
   */
  async getHeatmap(year: number = new Date().getFullYear()) {
    const response = await http.get<ApiResponse<Record<string, number>>>(
      '/analytics/heatmap',
      { params: { year } },
    );
    return unwrapApiResponse(response.data);
  },
};
