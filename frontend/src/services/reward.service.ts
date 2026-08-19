/**
 * reward.service.ts
 *
 * API layer for /api/rewards
 */

import { http, unwrapApiResponse } from '@/api/http';
import type { ApiResponse } from '@/types/api';
import type { RewardSummary } from '@/types/reward';

export const rewardService = {
  /** GET /api/rewards — get user gamification rewards and badges */
  async getRewards(): Promise<RewardSummary> {
    const response = await http.get<ApiResponse<RewardSummary>>('/rewards');
    return unwrapApiResponse(response.data);
  },
};
