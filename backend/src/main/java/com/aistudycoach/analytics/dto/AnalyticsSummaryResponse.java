package com.aistudycoach.analytics.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryResponse {
    private double totalFocusHours;
    private int completedSessions;
    private int completedTasks;
    private int activeStreakDays;
    private int productivityScore;
    private List<DailyFocusMetric> weeklyDistribution;
    private Map<String, Integer> categoryBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyFocusMetric {
        private String day;
        private double hours;
    }
}
