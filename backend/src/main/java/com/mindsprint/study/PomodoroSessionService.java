package com.mindsprint.study;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.study.dto.CreateSessionRequest;
import com.mindsprint.study.dto.PomodoroStatsResponse;
import com.mindsprint.study.dto.SessionResponse;
import com.mindsprint.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PomodoroSessionService {

    private final PomodoroSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public SessionResponse createSession(Authentication authentication, CreateSessionRequest request) {
        User user = getUser(authentication);

        PomodoroSession.SessionType type;
        try {
            type = PomodoroSession.SessionType.valueOf(request.getSessionType().toUpperCase());
        } catch (IllegalArgumentException e) {
            type = PomodoroSession.SessionType.WORK;
        }

        LocalDateTime now = LocalDateTime.now();

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .durationMinutes(request.getDurationMinutes())
                .sessionType(type)
                .taskId(request.getTaskId())
                .notes(request.getNotes())
                .startedAt(now.minusMinutes(request.getDurationMinutes()))
                .endedAt(now)
                .build();

        return toResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getSessions(Authentication authentication) {
        User user = getUser(authentication);
        return sessionRepository.findByUserOrderByStartedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PomodoroStatsResponse getStats(Authentication authentication) {
        User user = getUser(authentication);
        LocalDateTime startOfToday = LocalDate.now().atTime(LocalTime.MIN);

        long todaySessions = sessionRepository.countTodayWorkSessions(user, startOfToday);
        int todayMinutes = sessionRepository.sumTodayWorkMinutes(user, startOfToday);
        int totalMinutes = sessionRepository.sumTotalWorkMinutes(user);
        long totalSessions = sessionRepository.countByUserAndSessionType(user, PomodoroSession.SessionType.WORK);

        return PomodoroStatsResponse.builder()
                .todaySessions(todaySessions)
                .todayWorkMinutes(todayMinutes)
                .totalWorkMinutes(totalMinutes)
                .totalSessions(totalSessions)
                .build();
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName().toLowerCase();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private SessionResponse toResponse(PomodoroSession session) {
        return SessionResponse.builder()
                .id(session.getId())
                .durationMinutes(session.getDurationMinutes())
                .sessionType(session.getSessionType().name())
                .taskId(session.getTaskId())
                .notes(session.getNotes())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
