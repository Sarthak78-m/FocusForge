package com.mindsprint.study.dto;

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
public class CreateSessionRequest {

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Session type is required")
    private String sessionType; // WORK, SHORT_BREAK, LONG_BREAK

    /** Optional — link to a task ID */
    private Long taskId;

    /** Optional — brain dump notes from the session */
    private String notes;
}
