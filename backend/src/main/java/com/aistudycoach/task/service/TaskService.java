package com.aistudycoach.task.service;

import com.aistudycoach.exception.ResourceNotFoundException;
import com.aistudycoach.repository.TaskRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.task.Task;
import com.aistudycoach.task.TaskPriority;
import com.aistudycoach.task.TaskStatus;
import com.aistudycoach.task.dto.CreateTaskRequest;
import com.aistudycoach.task.dto.TaskResponse;
import com.aistudycoach.task.dto.UpdateTaskRequest;
import com.aistudycoach.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);

        Task task = Task.builder()
                .title(request.getTitle().trim())
                .description(normalizeNullableText(request.getDescription()))
                .status(TaskStatus.TODO)
                .priority(request.getPriority() == null ? TaskPriority.MEDIUM : request.getPriority())
                .dueDate(request.getDueDate())
                .user(user)
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(
            Authentication authentication,
            TaskStatus status,
            TaskPriority priority,
            LocalDate dueBefore,
            Pageable pageable
    ) {
        User user = getCurrentUser(authentication);
        return taskRepository.findUserTasks(user.getId(), status, priority, dueBefore, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId, Authentication authentication) {
        Task task = getOwnedTask(taskId, getCurrentUser(authentication));
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Authentication authentication) {
        Task task = getOwnedTask(taskId, getCurrentUser(authentication));

        if (request.getTitle() != null) {
            if (!StringUtils.hasText(request.getTitle())) {
                throw new IllegalArgumentException("Title cannot be blank");
            }
            task.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null) {
            task.setDescription(normalizeNullableText(request.getDescription()));
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        if (request.getStatus() != null) {
            applyStatus(task, request.getStatus());
        }

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse completeTask(Long taskId, Authentication authentication) {
        Task task = getOwnedTask(taskId, getCurrentUser(authentication));
        applyStatus(task, TaskStatus.COMPLETED);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId, Authentication authentication) {
        Task task = getOwnedTask(taskId, getCurrentUser(authentication));
        taskRepository.delete(task);
    }

    private Task getOwnedTask(Long taskId, User user) {
        return taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }

        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void applyStatus(Task task, TaskStatus status) {
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        }
        if (status != TaskStatus.COMPLETED) {
            task.setCompletedAt(null);
        }
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private String normalizeNullableText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
