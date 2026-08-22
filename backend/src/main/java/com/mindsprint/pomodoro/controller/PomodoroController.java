package com.mindsprint.pomodoro.controller;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.pomodoro.dto.StartSessionRequest;
import com.mindsprint.pomodoro.dto.PomodoroSessionResponse;
import com.mindsprint.pomodoro.service.PomodoroService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Pomodoro", description = "Pomodoro session management APIs")
@RestController
@RequestMapping("/api/pomodoro/sessions")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class PomodoroController {

    private final PomodoroService pomodoroService;

    @Operation(summary = "Start a Pomodoro session")
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> startSession(
            Authentication authentication,
            @Valid @RequestBody StartSessionRequest request
    ) {
        PomodoroSessionResponse created = pomodoroService.startSession(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session started successfully", created));
    }

    @Operation(summary = "Complete a Pomodoro session")
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> completeSession(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody com.mindsprint.pomodoro.dto.CompleteSessionRequest request
    ) {
        PomodoroSessionResponse response = pomodoroService.completeSession(authentication, id, request.getActualDuration());
        return ResponseEntity.ok(ApiResponse.success("Session completed successfully", response));
    }

    @Operation(summary = "Interrupt a Pomodoro session")
    @PostMapping("/{id}/interrupt")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> interruptSession(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody com.mindsprint.pomodoro.dto.CompleteSessionRequest request
    ) {
        PomodoroSessionResponse response = pomodoroService.interruptSession(authentication, id, request.getActualDuration());
        return ResponseEntity.ok(ApiResponse.success("Session interrupted successfully", response));
    }

    @Operation(summary = "Get all Pomodoro sessions for current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PomodoroSessionResponse>>> getSessions(Authentication authentication) {
        List<PomodoroSessionResponse> sessions = pomodoroService.getSessions(authentication);
        return ResponseEntity.ok(ApiResponse.success("Sessions fetched successfully", sessions));
    }

    @Operation(summary = "Get Pomodoro sessions for today")
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<PomodoroSessionResponse>>> getSessionsToday(Authentication authentication) {
        List<PomodoroSessionResponse> sessions = pomodoroService.getSessionsToday(authentication);
        return ResponseEntity.ok(ApiResponse.success("Today's sessions fetched successfully", sessions));
    }

    @Operation(summary = "Restore the current active Pomodoro session")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> getActiveSession(Authentication authentication) {
        PomodoroSessionResponse session = pomodoroService.restoreSession(authentication);
        String message = session == null ? "No active session" : "Active session restored successfully";
        return ResponseEntity.ok(ApiResponse.success(message, session));
    }

    @Operation(summary = "Get Pomodoro sessions for a task")
    @GetMapping("/task/{taskId}")
    public ResponseEntity<ApiResponse<List<PomodoroSessionResponse>>> getSessionsForTask(
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        List<PomodoroSessionResponse> sessions = pomodoroService.getSessionsForTask(authentication, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task sessions fetched successfully", sessions));
    }
}
