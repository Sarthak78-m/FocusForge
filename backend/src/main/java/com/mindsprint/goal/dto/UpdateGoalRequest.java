package com.mindsprint.goal.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import com.mindsprint.goal.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGoalRequest {

    @Size(max = 200, message = "Goal title cannot exceed 200 characters")
    private String title;

    @Size(max = 100, message = "Goal category cannot exceed 100 characters")
    private String category;

    @FutureOrPresent(message = "Target date must be in the present or future")
    private LocalDate targetDate;

    private String description;

    private GoalStatus status;
}
