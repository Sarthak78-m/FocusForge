package com.mindsprint.task.dto;

import com.mindsprint.task.TaskPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Payload for creating a study task")
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 160, message = "Title must not exceed 160 characters")
    @Schema(example = "Revise Spring Security JWT flow")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Schema(example = "Review filters, authentication provider, and token validation.")
    private String description;

    @Schema(example = "HIGH")
    private TaskPriority priority;

    @FutureOrPresent(message = "Due date cannot be in the past")
    @Schema(example = "2026-07-15")
    private LocalDate dueDate;
}
