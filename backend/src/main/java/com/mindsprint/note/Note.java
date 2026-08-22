package com.mindsprint.note;

import com.mindsprint.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
import java.util.ArrayList;
import java.util.List;
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
        name = "notes",
        indexes = {
                @Index(name = "idx_notes_user_id", columnList = "user_id"),
                @Index(name = "idx_notes_updated_at", columnList = "updated_at"),
                @Index(name = "idx_notes_subject", columnList = "subject")
        }
)
@EntityListeners(AuditingEntityListener.class)
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_notes_user")
    )
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 100)
    private String subject;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "note_tags",
            joinColumns = @JoinColumn(name = "note_id", foreignKey = @ForeignKey(name = "fk_note_tags_note"))
    )
    @Column(name = "tag", length = 100)
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(length = 100)
    private String folder;

    @Column(nullable = false)
    @Builder.Default
    private boolean favorite = false;

    @Column(name = "word_count", nullable = false)
    @Builder.Default
    private int wordCount = 0;

    @Column(name = "linked_task_id")
    private Long linkedTaskId;

    @Column(name = "linked_goal_id")
    private Long linkedGoalId;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
