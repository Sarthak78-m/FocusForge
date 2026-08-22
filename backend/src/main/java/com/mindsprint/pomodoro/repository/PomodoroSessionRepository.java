package com.mindsprint.pomodoro.repository;

import com.mindsprint.pomodoro.PomodoroSession;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.mindsprint.user.User;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {

    List<PomodoroSession> findByUserId(Long userId);

    List<PomodoroSession> findByTaskId(Long taskId);

    List<PomodoroSession> findByUserIdAndCreatedAtGreaterThanEqual(Long userId, LocalDateTime createdAt);

    @Query("SELECT COUNT(s) FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = com.mindsprint.pomodoro.PomodoroSessionType.FOCUS AND s.startedAt >= :startOfDay")
    long countTodayWorkSessions(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(s.actualDuration), 0) FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = com.mindsprint.pomodoro.PomodoroSessionType.FOCUS AND s.startedAt >= :startOfDay")
    int sumTodayWorkMinutes(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(s.actualDuration), 0) FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = com.mindsprint.pomodoro.PomodoroSessionType.FOCUS")
    int sumTotalWorkMinutes(@Param("user") User user);

    long countByUserAndSessionType(User user, com.mindsprint.pomodoro.PomodoroSessionType sessionType);

    @Query("SELECT s FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = com.mindsprint.pomodoro.PomodoroSessionType.FOCUS AND s.startedAt >= :from AND s.startedAt < :to "
            + "ORDER BY s.startedAt DESC")
    List<PomodoroSession> findWorkSessionsInRange(
            @Param("user") User user,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    List<PomodoroSession> findByUserIdAndStartedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
    List<PomodoroSession> findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(Long userId, com.mindsprint.pomodoro.PomodoroSessionType sessionType, com.mindsprint.pomodoro.SessionStatus status, LocalDateTime start, LocalDateTime end);
    List<PomodoroSession> findByUserIdAndSessionTypeAndStatus(Long userId, com.mindsprint.pomodoro.PomodoroSessionType sessionType, com.mindsprint.pomodoro.SessionStatus status);
    long countByUserIdAndStatus(Long userId, com.mindsprint.pomodoro.SessionStatus status);
}
