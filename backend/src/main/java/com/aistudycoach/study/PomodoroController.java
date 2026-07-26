package com.aistudycoach.study;

import com.aistudycoach.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * PomodoroController
 *
 * Stub controller for the Pomodoro sessions module.
 * Returns empty/zeroed data until the Pomodoro domain is implemented.
 *
 * Frontend expects:
 *   GET /api/pomodoro/sessions/stats  → session statistics
 */
@Tag(name = "Pomodoro", description = "Pomodoro session APIs")
@RestController
@RequestMapping("/api/pomodoro")
@SecurityRequirement(name = "bearerAuth")
public class PomodoroController {

    @Operation(summary = "Get session statistics")
    @GetMapping("/sessions/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = Map.of(
                "todaySessions", 0,
                "todayWorkMinutes", 0,
                "currentStreak", 0,
                "totalWorkMinutes", 0
        );
        return ResponseEntity.ok(ApiResponse.success("Pomodoro stats fetched", stats));
    }

    @Operation(summary = "Get all sessions")
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<Object>>> getSessions() {
        return ResponseEntity.ok(ApiResponse.success("Sessions fetched", List.of()));
    }
}
