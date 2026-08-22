package com.mindsprint.pomodoro.dto;

import com.mindsprint.pomodoro.PomodoroSessionType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroSessionResponse {
    private Long id;
    private int plannedDuration;
    private Integer actualDuration;
    private PomodoroSessionType sessionType;
    private Long taskId;
    private com.mindsprint.pomodoro.SessionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
}
