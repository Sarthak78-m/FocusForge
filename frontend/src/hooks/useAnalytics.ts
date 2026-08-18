import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import type { AnalyticsRange } from '@/types/analytics';

export const ANALYTICS_KEY = 'analytics';

export function useAnalytics(range: AnalyticsRange = '30d') {
  return useQuery({
    queryKey: [ANALYTICS_KEY, range],
    queryFn: () => analyticsService.getSummary(range),
    refetchOnWindowFocus: true,
  });
}
