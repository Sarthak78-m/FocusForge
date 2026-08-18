/**
 * reward.service.ts
 *
 * API layer for /api/rewards with fallback.
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { RewardSummary } from '@/types/reward';

export const rewardService = {
  /** GET /api/rewards — get user gamification rewards and badges */
  async getRewards(): Promise<RewardSummary> {
    try {
      const response = await http.get<ApiResponse<RewardSummary>>('/rewards');
      return unwrapApiResponse(response.data);
    } catch {
      // Fallback in case of local offline development
      return {
        currentXp: 0,
        level: 1,
        title: 'Scholar Level 1',
        nextLevelXp: 500,
        streakDays: 0,
        badges: [],
      };
    }
  },
};
