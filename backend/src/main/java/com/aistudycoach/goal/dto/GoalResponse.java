package com.aistudycoach.goal.dto;

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
    private String category;
    private LocalDate targetDate;
    private int currentUnits;
    private int totalUnits;
    private String unitName;
    private int progressPercentage;
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
