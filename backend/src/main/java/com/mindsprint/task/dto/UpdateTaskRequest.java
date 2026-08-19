package com.mindsprint.task.dto;

import com.mindsprint.task.TaskPriority;
import com.mindsprint.task.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
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
@Schema(description = "Payload for updating a study task")
public class UpdateTaskRequest {

    @Size(max = 160, message = "Title must not exceed 160 characters")
    @Schema(example = "Revise Spring Security JWT flow deeply")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Schema(example = "Add notes for authentication filters and exception handling.")
    private String description;

    @Schema(example = "IN_PROGRESS")
    private TaskStatus status;

    @Schema(example = "MEDIUM")
    private TaskPriority priority;

    @FutureOrPresent(message = "Due date cannot be in the past")
    @Schema(example = "2026-07-20")
    private LocalDate dueDate;
}
