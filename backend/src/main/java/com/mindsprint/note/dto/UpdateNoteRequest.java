package com.mindsprint.note.dto;

import jakarta.validation.constraints.Size;
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
public class UpdateNoteRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String content;

    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;

    private List<String> tags;

    @Size(max = 100, message = "Folder name must not exceed 100 characters")
    private String folder;

    private Boolean favorite;

    private Long linkedTaskId;

    private Long linkedGoalId;
}
