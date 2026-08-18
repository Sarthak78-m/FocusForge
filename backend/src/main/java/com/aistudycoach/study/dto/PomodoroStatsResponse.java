package com.aistudycoach.study.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroStatsResponse {
    private long todaySessions;
    private int todayWorkMinutes;
    private int totalWorkMinutes;
    private long totalSessions;
}
