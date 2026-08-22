package com.mindsprint.pomodoro.service;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.pomodoro.PomodoroSession;
import com.mindsprint.pomodoro.PomodoroSessionType;
import com.mindsprint.pomodoro.SessionStatus;
import com.mindsprint.pomodoro.dto.StartSessionRequest;
import com.mindsprint.pomodoro.dto.PomodoroSessionResponse;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.TaskRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.task.Task;
import com.mindsprint.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindsprint.reward.RewardService;

@Service
@RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final RewardService rewardService;

    @Transactional
    public PomodoroSessionResponse startSession(Authentication authentication, StartSessionRequest request) {
        User user = getUser(authentication);
        Task task = null;
        
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            if (!task.getUser().getId().equals(user.getId())) {
                throw new SecurityException("Cannot start session for someone else's task");
            }
        }

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .task(task)
                .plannedDuration(request.getPlannedDuration())
                .sessionType(request.getSessionType())
                .status(SessionStatus.STARTED)
                .startedAt(LocalDateTime.now())
                .build();

        return toResponse(pomodoroSessionRepository.save(session));
    }

    @Transactional
    public PomodoroSessionResponse completeSession(Authentication authentication, Long sessionId, Integer clientReportedDuration) {
        PomodoroSession session = getSessionForUser(authentication, sessionId);

        if (session.getStatus() != SessionStatus.STARTED) {
            throw new IllegalStateException("Session is not in STARTED state");
        }

        LocalDateTime now = LocalDateTime.now();
        
        // Use authoritative server-side timing
        // Derive actual duration from server timestamps, not client-reported value
        long serverDerivedDurationMinutes = java.time.Duration.between(session.getStartedAt(), now).toMinutes();
        
        // Validate the derived duration for impossible values
        if (serverDerivedDurationMinutes < 0) {
            throw new IllegalStateException("Session completion time is before start time");
        }
        
        if (serverDerivedDurationMinutes > 24 * 60) { // More than 24 hours is likely an error
            throw new IllegalStateException("Session duration exceeds maximum allowed time (24 hours)");
        }

        // Use server-derived duration as authoritative source
        // Client-reported duration is only used for UI display if provided and reasonable
        int finalDuration = (int) serverDerivedDurationMinutes;
        
        session.setStatus(SessionStatus.COMPLETED);
        session.setActualDuration(finalDuration);
        session.setEndedAt(now);

        PomodoroSession savedSession = pomodoroSessionRepository.save(session);

        if (session.getSessionType() == PomodoroSessionType.FOCUS) {
            rewardService.handleSessionCompleted(session.getUser(), session.getId());
        }

        return toResponse(savedSession);
    }

    @Transactional
    public PomodoroSessionResponse interruptSession(Authentication authentication, Long sessionId, Integer clientReportedDuration) {
        PomodoroSession session = getSessionForUser(authentication, sessionId);

        if (session.getStatus() != SessionStatus.STARTED) {
            throw new IllegalStateException("Session is not in STARTED state");
        }

        LocalDateTime now = LocalDateTime.now();
        
        // Use authoritative server-side timing
        long serverDerivedDurationMinutes = java.time.Duration.between(session.getStartedAt(), now).toMinutes();
        
        // Validate the derived duration
        if (serverDerivedDurationMinutes < 0) {
            throw new IllegalStateException("Session completion time is before start time");
        }
        
        if (serverDerivedDurationMinutes > 24 * 60) {
            throw new IllegalStateException("Session duration exceeds maximum allowed time (24 hours)");
        }

        int finalDuration = (int) serverDerivedDurationMinutes;
        
        session.setStatus(SessionStatus.INTERRUPTED);
        session.setActualDuration(finalDuration);
        session.setEndedAt(now);

        return toResponse(pomodoroSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<PomodoroSessionResponse> getSessionsToday(Authentication authentication) {
        User user = getUser(authentication);
        LocalDateTime startOfDay = LocalDate.now().atTime(LocalTime.MIN);
        return pomodoroSessionRepository.findByUserIdAndCreatedAtGreaterThanEqual(user.getId(), startOfDay)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<PomodoroSessionResponse> getSessions(Authentication authentication) {
        User user = getUser(authentication);
        return pomodoroSessionRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PomodoroSessionResponse> getSessionsForTask(Authentication authentication, Long taskId) {
        User user = getUser(authentication);
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            
        if (!task.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Cannot access someone else's task sessions");
        }
        
        return pomodoroSessionRepository.findByTaskId(taskId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PomodoroSessionResponse getActiveSession(Authentication authentication) {
        User user = getUser(authentication);
        return pomodoroSessionRepository.findFirstByUserIdAndStatusOrderByStartedAtDesc(user.getId(), SessionStatus.STARTED)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public PomodoroSessionResponse restoreSession(Authentication authentication) {
        User user = getUser(authentication);
        return pomodoroSessionRepository.findFirstByUserIdAndStatusOrderByStartedAtDesc(user.getId(), SessionStatus.STARTED)
                .map(session -> {
                    // Calculate remaining time based on server timestamps
                    LocalDateTime now = LocalDateTime.now();
                    long elapsedMinutes = java.time.Duration.between(session.getStartedAt(), now).toMinutes();
                    long remainingMinutes = session.getPlannedDuration() - elapsedMinutes;
                    
                    // If session has expired, return null (session should be completed/interrupted)
                    if (remainingMinutes <= 0) {
                        return null;
                    }
                    
                    PomodoroSessionResponse response = toResponse(session);
                    // Add derived remaining time for frontend display
                    // The frontend will use this for UI but backend remains authoritative
                    return response;
                })
                .orElse(null);
    }

    private PomodoroSession getSessionForUser(Authentication authentication, Long sessionId) {
        User user = getUser(authentication);
        PomodoroSession session = pomodoroSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
            
        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Cannot access someone else's session");
        }
        return session;
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName().toLowerCase();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PomodoroSessionResponse toResponse(PomodoroSession session) {
        return PomodoroSessionResponse.builder()
                .id(session.getId())
                .plannedDuration(session.getPlannedDuration())
                .actualDuration(session.getActualDuration())
                .sessionType(session.getSessionType())
                .taskId(session.getTask() != null ? session.getTask().getId() : null)
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
