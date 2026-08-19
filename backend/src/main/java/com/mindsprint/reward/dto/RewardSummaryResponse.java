package com.mindsprint.reward.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardSummaryResponse {
    private int currentXp;
    private int level;
    private String title;
    private int nextLevelXp;
    private int streakDays;
    private List<BadgeDto> badges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeDto {
        private String id;
        private String name;
        private String description;
        private String icon;
        private boolean unlocked;
        private String unlockedAt;
    }
}
