package com.mindsprint.goal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.goal.Goal;
import com.mindsprint.goal.GoalStatus;
import com.mindsprint.goal.dto.CreateGoalRequest;
import com.mindsprint.goal.dto.UpdateGoalRequest;
import com.mindsprint.goal.dto.GoalResponse;
import com.mindsprint.goal.repository.GoalRepository;
import com.mindsprint.repository.TaskRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.task.Task;
import com.mindsprint.task.TaskStatus;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private com.mindsprint.reward.RewardService rewardService;

    private GoalService goalService;

    private User user;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        goalService = new GoalService(goalRepository, userRepository, taskRepository, rewardService);
        user = User.builder()
                .id(1L)
                .name("Test User")
                .email("user@mindsprint.com")
                .role(Role.USER)
                .build();
        authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of());
    }

    @Test
    void createGoal_Success() {
        CreateGoalRequest request = CreateGoalRequest.builder()
                .title("Read 10 Books")
                .category("Learning")
                .targetDate(LocalDate.now().plusMonths(1))
                .description("My reading goal")
                .build();

        when(userRepository.findByEmail("user@mindsprint.com")).thenReturn(Optional.of(user));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> {
            Goal g = inv.getArgument(0);
            g.setId(100L);
            return g;
        });

        GoalResponse response = goalService.createGoal(request, authentication);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Read 10 Books");
        assertThat(response.getCategory()).isEqualTo("Learning");
        assertThat(response.getDescription()).isEqualTo("My reading goal");
        assertThat(response.getStatus()).isEqualTo(GoalStatus.ACTIVE);
        assertThat(response.getProgress()).isEqualTo(0);

        ArgumentCaptor<Goal> captor = ArgumentCaptor.forClass(Goal.class);
        verify(goalRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isEqualTo(user);
    }

    @Test
    void getGoals_ReturnsPagedResponseWithProgress() {
        Goal goal = Goal.builder()
                .id(101L)
                .user(user)
                .title("Complete 50 LeetCode problems")
                .category("Coding")
                .targetDate(LocalDate.now().plusDays(20))
                .status(GoalStatus.ACTIVE)
                .build();

        Task completedTask = Task.builder().status(TaskStatus.COMPLETED).build();
        Task pendingTask = Task.builder().status(TaskStatus.TODO).build();

        when(userRepository.findByEmail("user@mindsprint.com")).thenReturn(Optional.of(user));
        when(goalRepository.findByUserId(1L, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(goal)));
        when(taskRepository.findByGoalId(101L)).thenReturn(List.of(completedTask, pendingTask));

        Page<GoalResponse> result = goalService.getGoals(authentication, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getProgress()).isEqualTo(50);
    }

    @Test
    void getActiveGoals_ReturnsOnlyActive() {
        Goal goal = Goal.builder()
                .id(102L)
                .user(user)
                .title("Daily Meditation")
                .category("Wellness")
                .targetDate(LocalDate.now().plusDays(10))
                .status(GoalStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("user@mindsprint.com")).thenReturn(Optional.of(user));
        when(goalRepository.findByUserIdAndStatus(1L, GoalStatus.ACTIVE)).thenReturn(List.of(goal));

        List<GoalResponse> active = goalService.getActiveGoals(authentication);

        assertThat(active).hasSize(1);
        assertThat(active.get(0).getTitle()).isEqualTo("Daily Meditation");
    }

    @Test
    void updateGoal_Success() {
        Goal goal = Goal.builder()
                .id(103L)
                .user(user)
                .title("Run 20km")
                .category("Fitness")
                .targetDate(LocalDate.now().plusDays(5))
                .status(GoalStatus.ACTIVE)
                .build();

        UpdateGoalRequest request = UpdateGoalRequest.builder()
                .status(GoalStatus.COMPLETED)
                .description("Completed run")
                .build();

        when(userRepository.findByEmail("user@mindsprint.com")).thenReturn(Optional.of(user));
        when(goalRepository.findByIdAndUserId(103L, 1L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        GoalResponse response = goalService.updateGoal(103L, request, authentication);

        assertThat(response.getStatus()).isEqualTo(GoalStatus.COMPLETED);
        assertThat(response.getDescription()).isEqualTo("Completed run");
    }

    @Test
    void deleteGoal_SuccessAndNullifiesTasks() {
        Goal goal = Goal.builder()
                .id(104L)
                .user(user)
                .title("Deprecated goal")
                .build();

        Task task1 = Task.builder().id(1L).goal(goal).build();
        Task task2 = Task.builder().id(2L).goal(goal).build();

        when(userRepository.findByEmail("user@mindsprint.com")).thenReturn(Optional.of(user));
        when(goalRepository.findByIdAndUserId(104L, 1L)).thenReturn(Optional.of(goal));
        when(taskRepository.findByGoalId(104L)).thenReturn(List.of(task1, task2));

        goalService.deleteGoal(104L, authentication);

        verify(taskRepository).save(task1);
        verify(taskRepository).save(task2);
        assertThat(task1.getGoal()).isNull();
        assertThat(task2.getGoal()).isNull();
        verify(goalRepository).delete(goal);
    }

    @Test
    void deleteGoal_NotFound_ThrowsException() {
        when(userRepository.findByEmail("user@mindsprint.com")).thenReturn(Optional.of(user));
        when(goalRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> goalService.deleteGoal(999L, authentication))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Goal not found");
    }
}
