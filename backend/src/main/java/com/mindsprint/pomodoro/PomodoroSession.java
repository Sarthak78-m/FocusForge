package com.mindsprint.pomodoro;

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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "pomodoro_sessions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_pomo_user_active_session",
                        columnNames = {"user_id", "active_session_key"}
                )
        },
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "task_id",
            foreignKey = @ForeignKey(name = "fk_pomo_session_task")
    )
    private com.mindsprint.task.Task task;

    @Column(name = "planned_duration", nullable = false)
    private int plannedDuration;

    @Column(name = "actual_duration")
    private Integer actualDuration;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 20)
    private PomodoroSessionType sessionType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SessionStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    /**
     * A non-null value exists only while the session is STARTED. Combined with
     * user_id, it creates a portable database-level one-active-session guard.
     */
    @Column(name = "active_session_key", length = 20)
    private String activeSessionKey;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
