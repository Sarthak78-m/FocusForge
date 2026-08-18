package com.aistudycoach.goal.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {

    @NotBlank(message = "Goal title is required")
    @Size(max = 200, message = "Goal title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Goal category is required")
    @Size(max = 100, message = "Goal category cannot exceed 100 characters")
    private String category;

    @NotNull(message = "Target date is required")
    @FutureOrPresent(message = "Target date must be in the present or future")
    private LocalDate targetDate;

    @Min(value = 1, message = "Total units must be at least 1")
    private int totalUnits;

    @NotBlank(message = "Unit name is required")
    @Size(max = 50, message = "Unit name cannot exceed 50 characters")
    private String unitName;
}
