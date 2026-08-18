package com.aistudycoach.study;

import com.aistudycoach.user.User;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {

    List<PomodoroSession> findByUserOrderByStartedAtDesc(User user);

    /** Count work sessions completed today */
    @Query("SELECT COUNT(s) FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = 'WORK' AND s.startedAt >= :startOfDay")
    long countTodayWorkSessions(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay);

    /** Sum of work minutes today */
    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = 'WORK' AND s.startedAt >= :startOfDay")
    int sumTodayWorkMinutes(@Param("user") User user, @Param("startOfDay") LocalDateTime startOfDay);

    /** Total work minutes all time */
    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = 'WORK'")
    int sumTotalWorkMinutes(@Param("user") User user);

    /** Total work sessions all time */
    long countByUserAndSessionType(User user, PomodoroSession.SessionType sessionType);

    /** Work sessions in a date range (for analytics) */
    @Query("SELECT s FROM PomodoroSession s WHERE s.user = :user "
            + "AND s.sessionType = 'WORK' AND s.startedAt >= :from AND s.startedAt < :to "
            + "ORDER BY s.startedAt DESC")
    List<PomodoroSession> findWorkSessionsInRange(
            @Param("user") User user,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
