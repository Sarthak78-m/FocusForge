import { useQuery } from '@tanstack/react-query';
import { rewardService } from '@/services/reward.service';

export const REWARDS_SUMMARY_KEY = 'rewards-summary';
export const REWARDS_HISTORY_KEY = 'rewards-history';
export const REWARDS_ACHIEVEMENTS_KEY = 'rewards-achievements';

export function useRewardSummary() {
  return useQuery({
    queryKey: [REWARDS_SUMMARY_KEY],
    queryFn: () => rewardService.getSummary(),
    refetchOnWindowFocus: true,
  });
}

export function useRewardHistory() {
  return useQuery({
    queryKey: [REWARDS_HISTORY_KEY],
    queryFn: () => rewardService.getHistory(),
    refetchOnWindowFocus: true,
  });
}

export function useRewardAchievements() {
  return useQuery({
    queryKey: [REWARDS_ACHIEVEMENTS_KEY],
    queryFn: () => rewardService.getAchievements(),
    refetchOnWindowFocus: true,
  });
}
