package com.aistudycoach.notes;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteDto {
    private String id;
    private String title;
    private String content;
    private String preview;
    private String folder;
    private List<String> tags;
    private boolean favorite;
    private int wordCount;
    private Long createdAt;
    private Long updatedAt;
}
