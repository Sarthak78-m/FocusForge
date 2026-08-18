package com.aistudycoach.study;

import com.aistudycoach.auth.dto.ApiResponse;
import com.aistudycoach.study.dto.CreateSessionRequest;
import com.aistudycoach.study.dto.PomodoroStatsResponse;
import com.aistudycoach.study.dto.SessionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Pomodoro", description = "Pomodoro session APIs")
@RestController
@RequestMapping("/api/pomodoro")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroSessionService pomodoroSessionService;

    @Operation(summary = "Record a completed Pomodoro session")
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            Authentication authentication,
            @Valid @RequestBody CreateSessionRequest request
    ) {
        SessionResponse created = pomodoroSessionService.createSession(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session recorded successfully", created));
    }

    @Operation(summary = "Get all sessions for current user")
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessions(Authentication authentication) {
        List<SessionResponse> sessions = pomodoroSessionService.getSessions(authentication);
        return ResponseEntity.ok(ApiResponse.success("Sessions fetched", sessions));
    }

    @Operation(summary = "Get session statistics")
    @GetMapping("/sessions/stats")
    public ResponseEntity<ApiResponse<PomodoroStatsResponse>> getStats(Authentication authentication) {
        PomodoroStatsResponse stats = pomodoroSessionService.getStats(authentication);
        return ResponseEntity.ok(ApiResponse.success("Pomodoro stats fetched", stats));
    }
}
