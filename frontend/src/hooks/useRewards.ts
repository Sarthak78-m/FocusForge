import { useQuery } from '@tanstack/react-query';
import { rewardService } from '@/services/reward.service';

export const REWARDS_KEY = 'rewards';

export function useRewards() {
  return useQuery({
    queryKey: [REWARDS_KEY],
    queryFn: () => rewardService.getRewards(),
    refetchOnWindowFocus: true,
  });
}
