package com.mindsprint.goal.dto;

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
    private String description;
    private com.mindsprint.goal.GoalStatus status;
    private Integer progress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
