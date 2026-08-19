package com.mindsprint.notes;

import com.mindsprint.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
                @Index(name = "idx_notes_updated_at", columnList = "updated_at")
        }
)
public class Note {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String preview;

    @Column(length = 100)
    private String folder;

    @Column(length = 500)
    private String tags;

    @Column(nullable = false)
    @Builder.Default
    private boolean favorite = false;

    @Column(name = "word_count", nullable = false)
    @Builder.Default
    private int wordCount = 0;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    @Column(name = "updated_at", nullable = false)
    private Long updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_notes_user")
    )
    private User user;
}
