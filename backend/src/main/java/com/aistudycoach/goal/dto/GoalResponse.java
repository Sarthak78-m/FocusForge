package com.aistudycoach.goal.dto;

import com.aistudycoach.goal.GoalCategory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private Long id;
    private String title;
    private GoalCategory category;
    private LocalDate targetDate;
    private int currentUnits;
    private int totalUnits;
    private String unitName;
    private int progressPercentage;
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
