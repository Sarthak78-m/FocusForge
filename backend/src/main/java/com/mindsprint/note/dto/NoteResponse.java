package com.mindsprint.note.dto;

import java.time.LocalDateTime;
import java.util.List;
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
public class NoteResponse {

    private Long id;
    private String title;
    private String content;
    private String subject;
    private List<String> tags;
    private String folder;
    private boolean favorite;
    private int wordCount;
    private Long linkedTaskId;
    private Long linkedGoalId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
