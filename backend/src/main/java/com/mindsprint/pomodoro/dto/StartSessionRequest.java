package com.mindsprint.pomodoro.dto;

import com.mindsprint.pomodoro.PomodoroSessionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartSessionRequest {

    @NotNull(message = "Planned duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer plannedDuration;

    @NotNull(message = "Session type is required")
    private PomodoroSessionType sessionType;

    private Long taskId;
}
