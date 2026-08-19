package com.mindsprint.task.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.repository.TaskRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.task.Task;
import com.mindsprint.task.TaskPriority;
import com.mindsprint.task.TaskStatus;
import com.mindsprint.task.dto.CreateTaskRequest;
import com.mindsprint.task.dto.TaskResponse;
import com.mindsprint.user.Role;
import com.mindsprint.user.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    private TaskService taskService;

    private User user;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository, userRepository);
        user = User.builder()
                .id(1L)
                .name("Sarthak Sharma")
                .email("user@gmail.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();
        authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of());
    }

    @Test
    void createTaskSuccess() {
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Revise JWT")
                .description("Review auth filters")
                .priority(TaskPriority.HIGH)
                .dueDate(LocalDate.now().plusDays(2))
                .build();

        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(10L);
            return task;
        });

        TaskResponse response = taskService.createTask(request, authentication);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTitle()).isEqualTo("Revise JWT");
        assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(response.getPriority()).isEqualTo(TaskPriority.HIGH);

        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(taskCaptor.capture());
        assertThat(taskCaptor.getValue().getUser()).isEqualTo(user);
    }

    @Test
    void createTaskDefaultsPriorityToMedium() {
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Read JPA docs")
                .build();

        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.createTask(request, authentication);

        assertThat(response.getPriority()).isEqualTo(TaskPriority.MEDIUM);
        assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);
    }

    @Test
    void completeTaskSetsCompletedStatusAndTimestamp() {
        Task task = Task.builder()
                .id(10L)
                .title("Finish module")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.MEDIUM)
                .user(user)
                .build();

        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.completeTask(10L, authentication);

        assertThat(response.getStatus()).isEqualTo(TaskStatus.COMPLETED);
        assertThat(response.getCompletedAt()).isNotNull();
    }

    @Test
    void getTaskThrowsWhenTaskDoesNotBelongToUser() {
        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTask(99L, authentication))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Task not found");
    }
}
