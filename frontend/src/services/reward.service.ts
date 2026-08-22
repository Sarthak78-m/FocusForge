/**
 * reward.service.ts
 *
 * API layer for /api/rewards
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { RewardSummary, RewardHistoryItem, Achievement } from '@/types/reward';

export const rewardService = {
  /** GET /api/rewards/summary — get user gamification summary */
  async getSummary(): Promise<RewardSummary> {
    const response = await http.get<ApiResponse<RewardSummary>>('/rewards/summary');
    return unwrapApiResponse(response.data);
  },

  /** GET /api/rewards/history — get user reward history */
  async getHistory(): Promise<RewardHistoryItem[]> {
    const response = await http.get<ApiResponse<RewardHistoryItem[]>>('/rewards/history');
    return unwrapApiResponse(response.data);
  },

  /** GET /api/rewards/achievements — get user achievements */
  async getAchievements(): Promise<Achievement[]> {
    const response = await http.get<ApiResponse<Achievement[]>>('/rewards/achievements');
    return unwrapApiResponse(response.data);
  },
};
