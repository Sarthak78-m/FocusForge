package com.mindsprint.task.controller;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.task.TaskPriority;
import com.mindsprint.task.TaskStatus;
import com.mindsprint.task.dto.CreateTaskRequest;
import com.mindsprint.task.dto.TaskResponse;
import com.mindsprint.task.dto.UpdateTaskRequest;
import com.mindsprint.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Tasks", description = "Authenticated work task management APIs")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Create a task")
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication
    ) {
        TaskResponse response = taskService.createTask(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    @Operation(summary = "List current user's tasks")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @Parameter(description = "Return tasks due on or before this date")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dueBefore,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication
    ) {
        Page<TaskResponse> response = taskService.getTasks(
                authentication,
                status,
                priority,
                dueBefore,
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched successfully", response));
    }

    @Operation(summary = "Get a task by id")
    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        TaskResponse response = taskService.getTask(taskId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Task fetched successfully", response));
    }

    @Operation(summary = "Update a task")
    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication
    ) {
        TaskResponse response = taskService.updateTask(taskId, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    @Operation(summary = "Mark a task as completed")
    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        TaskResponse response = taskService.completeTask(taskId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Task completed successfully", response));
    }

    @Operation(summary = "Reopen a completed task")
    @PatchMapping("/{taskId}/reopen")
    public ResponseEntity<ApiResponse<TaskResponse>> reopenTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        TaskResponse response = taskService.reopenTask(taskId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Task reopened successfully", response));
    }

    @Operation(summary = "Delete a task")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long taskId,
            Authentication authentication
    ) {
        taskService.deleteTask(taskId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
