import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import type { AnalyticsRange } from '@/types/analytics';

export const ANALYTICS_KEY = 'analytics';

export function useAnalytics() {
  return useQuery({
    queryKey: [ANALYTICS_KEY],
    queryFn: () => analyticsService.getSummary(),
    refetchOnWindowFocus: true,
  });
}
