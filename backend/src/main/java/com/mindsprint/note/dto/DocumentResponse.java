package com.mindsprint.note.dto;

import com.mindsprint.note.DocumentStatus;
import java.time.LocalDateTime;
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
public class DocumentResponse {

    private Long id;
    private String filename;
    private String originalName;
    private String subject;
    private Integer pageCount;
    private Long fileSizeBytes;
    private DocumentStatus status;
    private String summary;
    private LocalDateTime uploadedAt;
}
