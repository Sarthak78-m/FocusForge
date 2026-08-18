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
  async getSummary(range: AnalyticsRange = '30d'): Promise<AnalyticsSummary> {
    try {
      const response = await http.get<ApiResponse<AnalyticsSummary>>('/analytics/summary', {
        params: { range },
      });
      return unwrapApiResponse(response.data);
    } catch {
      return {
        totalFocusHours: 0,
        completedSessions: 0,
        completedTasks: 0,
        activeStreakDays: 0,
        productivityScore: 100,
        weeklyDistribution: [
          { day: 'Mon', hours: 0 },
          { day: 'Tue', hours: 0 },
          { day: 'Wed', hours: 0 },
          { day: 'Thu', hours: 0 },
          { day: 'Fri', hours: 0 },
          { day: 'Sat', hours: 0 },
          { day: 'Sun', hours: 0 },
        ],
        categoryBreakdown: {},
      };
    }
  },
};
