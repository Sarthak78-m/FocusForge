package com.mindsprint.study;

import com.mindsprint.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "pomodoro_sessions",
        indexes = {
                @Index(name = "idx_pomo_user_id", columnList = "user_id"),
                @Index(name = "idx_pomo_started_at", columnList = "started_at")
        }
)
@EntityListeners(AuditingEntityListener.class)
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_pomo_session_user")
    )
    private User user;

    /** Duration of the session in minutes (e.g. 25, 50, 90) */
    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    /** The type of session: WORK, SHORT_BREAK, LONG_BREAK */
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 20)
    private SessionType sessionType;

    /** Optional linked task ID */
    @Column(name = "task_id")
    private Long taskId;

    /** Brain dump / notes from the session */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum SessionType {
        WORK,
        SHORT_BREAK,
        LONG_BREAK
    }
}
