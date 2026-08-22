package com.mindsprint.pomodoro.service;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.exception.SessionConflictException;
import com.mindsprint.pomodoro.PomodoroSession;
import com.mindsprint.pomodoro.PomodoroSessionType;
import com.mindsprint.pomodoro.SessionStatus;
import com.mindsprint.pomodoro.dto.PomodoroSessionResponse;
import com.mindsprint.pomodoro.dto.StartSessionRequest;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.TaskRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.reward.RewardService;
import com.mindsprint.task.Task;
import com.mindsprint.user.User;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PomodoroService {

    private static final String ACTIVE_SESSION_KEY = "STARTED";

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final RewardService rewardService;

    @Transactional
    public PomodoroSessionResponse startSession(Authentication authentication, StartSessionRequest request) {
        User user = getUserForUpdate(authentication);
        LocalDateTime now = LocalDateTime.now();

        PomodoroSession existing = pomodoroSessionRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDesc(user.getId(), SessionStatus.STARTED)
                .orElse(null);
        if (existing != null) {
            if (!hasExpired(existing, now)) {
                return toResponse(existing);
            }
            reconcileExpiredSession(existing, now);
        }

        Task task = getTaskForUser(user, request.getTaskId());
        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .task(task)
                .plannedDuration(request.getPlannedDuration())
                .sessionType(request.getSessionType())
                .status(SessionStatus.STARTED)
                .activeSessionKey(ACTIVE_SESSION_KEY)
                .startedAt(now)
                .build();

        return toResponse(pomodoroSessionRepository.saveAndFlush(session));
    }

    @Transactional
    public PomodoroSessionResponse completeSession(
            Authentication authentication,
            Long sessionId,
            Integer clientReportedDuration
    ) {
        PomodoroSession session = getSessionForUser(authentication, sessionId);
        if (session.getStatus() == SessionStatus.COMPLETED) {
            return toResponse(session);
        }
        if (session.getStatus() != SessionStatus.STARTED) {
            throw new SessionConflictException("Session is no longer active");
        }

        LocalDateTime now = LocalDateTime.now();
        int actualDuration = durationFromServerTimestamps(session, now);
        completeSession(session, now, actualDuration);
        return toResponse(session);
    }

    @Transactional
    public PomodoroSessionResponse interruptSession(
            Authentication authentication,
            Long sessionId,
            Integer clientReportedDuration
    ) {
        PomodoroSession session = getSessionForUser(authentication, sessionId);
        if (session.getStatus() == SessionStatus.INTERRUPTED) {
            return toResponse(session);
        }
        if (session.getStatus() != SessionStatus.STARTED) {
            throw new SessionConflictException("Session is no longer active");
        }

        LocalDateTime now = LocalDateTime.now();
        session.setStatus(SessionStatus.INTERRUPTED);
        session.setActualDuration(durationFromServerTimestamps(session, now));
        session.setEndedAt(now);
        session.setActiveSessionKey(null);

        return toResponse(pomodoroSessionRepository.saveAndFlush(session));
    }

    @Transactional
    public PomodoroSessionResponse restoreSession(Authentication authentication) {
        User user = getUserForUpdate(authentication);
        PomodoroSession session = pomodoroSessionRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDesc(user.getId(), SessionStatus.STARTED)
                .orElse(null);
        if (session == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (hasExpired(session, now)) {
            reconcileExpiredSession(session, now);
        }
        return toResponse(session);
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

    private Task getTaskForUser(User user, Long taskId) {
        if (taskId == null) {
            return null;
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Cannot start session for someone else's task");
        }
        return task;
    }

    private void reconcileExpiredSession(PomodoroSession session, LocalDateTime now) {
        log.info("Reconciling expired Pomodoro session {} for user {}", session.getId(), session.getUser().getId());
        completeSession(session, now, durationFromServerTimestamps(session, now));
    }

    private void completeSession(PomodoroSession session, LocalDateTime endedAt, int actualDuration) {
        session.setStatus(SessionStatus.COMPLETED);
        session.setActualDuration(actualDuration);
        session.setEndedAt(endedAt);
        session.setActiveSessionKey(null);
        pomodoroSessionRepository.saveAndFlush(session);

        if (session.getSessionType() == PomodoroSessionType.FOCUS) {
            rewardService.handleSessionCompleted(session.getUser(), session.getId());
        }
    }

    private boolean hasExpired(PomodoroSession session, LocalDateTime now) {
        return !now.isBefore(session.getStartedAt().plusMinutes(session.getPlannedDuration()));
    }

    private int durationFromServerTimestamps(PomodoroSession session, LocalDateTime endedAt) {
        long duration = Duration.between(session.getStartedAt(), endedAt).toMinutes();
        if (duration < 0) {
            throw new IllegalStateException("Session completion time is before start time");
        }
        return Math.toIntExact(duration);
    }

    private PomodoroSession getSessionForUser(Authentication authentication, Long sessionId) {
        User user = getUserForUpdate(authentication);
        return pomodoroSessionRepository.findByIdAndUserIdForUpdate(sessionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
    }

    private User getUserForUpdate(Authentication authentication) {
        return userRepository.findByEmailForUpdate(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName().toLowerCase())
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
