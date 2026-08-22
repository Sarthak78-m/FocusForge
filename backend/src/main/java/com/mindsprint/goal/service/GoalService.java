package com.mindsprint.goal.service;

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
import com.mindsprint.user.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindsprint.reward.RewardService;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final RewardService rewardService;

    @Transactional
    public GoalResponse createGoal(CreateGoalRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);

        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle() != null ? request.getTitle().trim() : null)
                .category(request.getCategory() != null ? request.getCategory().trim() : null)
                .targetDate(request.getTargetDate())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(GoalStatus.ACTIVE)
                .build();

        return toGoalResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse updateGoal(Long id, UpdateGoalRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.getTitle() != null) goal.setTitle(request.getTitle().trim());
        if (request.getCategory() != null) goal.setCategory(request.getCategory().trim());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());
        if (request.getDescription() != null) goal.setDescription(request.getDescription().trim());
        boolean newlyCompleted = false;
        if (request.getStatus() != null && goal.getStatus() != request.getStatus()) {
            goal.setStatus(request.getStatus());
            if (request.getStatus() == GoalStatus.COMPLETED) {
                newlyCompleted = true;
            }
        }

        Goal savedGoal = goalRepository.save(goal);
        
        if (newlyCompleted) {
            rewardService.handleGoalCompleted(user, savedGoal.getId());
        }
        
        return toGoalResponse(savedGoal);
    }

    @Transactional(readOnly = true)
    public Page<GoalResponse> getGoals(Authentication authentication, Pageable pageable) {
        User user = getCurrentUser(authentication);
        return goalRepository.findByUserId(user.getId(), pageable).map(this::toGoalResponse);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getActiveGoals(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return goalRepository.findByUserIdAndStatus(user.getId(), GoalStatus.ACTIVE)
                .stream()
                .map(this::toGoalResponse)
                .toList();
    }

    @Transactional
    public void deleteGoal(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Goal goal = goalRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        
        List<Task> tasks = taskRepository.findByGoalId(goal.getId());
        for (Task task : tasks) {
            task.setGoal(null);
            taskRepository.save(task);
        }
        
        goalRepository.delete(goal);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }

        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private int calculateProgress(Goal goal) {
        List<Task> tasks = taskRepository.findByGoalId(goal.getId());
        if (tasks.isEmpty()) return 0;
        long completedCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        return (int) ((completedCount * 100) / tasks.size());
    }

    private GoalResponse toGoalResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .category(goal.getCategory())
                .description(goal.getDescription())
                .status(goal.getStatus())
                .targetDate(goal.getTargetDate())
                .progress(calculateProgress(goal))
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
