package com.mindsprint.goal;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.goal.dto.GoalRequest;
import com.mindsprint.goal.dto.GoalResponse;
import com.mindsprint.repository.GoalRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<GoalResponse> getGoals(Authentication authentication, Pageable pageable) {
        User user = getUser(authentication);
        return goalRepository.findByUser(user, pageable).map(this::toGoalResponse);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getActiveGoals(Authentication authentication) {
        User user = getUser(authentication);
        return goalRepository.findByUserAndCompletedFalse(user)
                .stream()
                .map(this::toGoalResponse)
                .toList();
    }

    @Transactional
    public GoalResponse createGoal(Authentication authentication, GoalRequest request) {
        User user = getUser(authentication);

        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .targetDate(request.getTargetDate())
                .totalUnits(request.getTotalUnits())
                .unitName(request.getUnitName().trim())
                .currentUnits(0)
                .completed(false)
                .build();

        return toGoalResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse incrementProgress(Authentication authentication, Long goalId, int unitsToAdd) {
        User user = getUser(authentication);
        Goal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        int nextUnits = Math.min(goal.getTotalUnits(), goal.getCurrentUnits() + Math.max(1, unitsToAdd));
        goal.setCurrentUnits(nextUnits);
        if (nextUnits >= goal.getTotalUnits()) {
            goal.setCompleted(true);
        }

        return toGoalResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(Authentication authentication, Long goalId) {
        User user = getUser(authentication);
        Goal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName().toLowerCase();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private GoalResponse toGoalResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .category(goal.getCategory())
                .targetDate(goal.getTargetDate())
                .currentUnits(goal.getCurrentUnits())
                .totalUnits(goal.getTotalUnits())
                .unitName(goal.getUnitName())
                .progressPercentage(goal.getProgressPercentage())
                .completed(goal.isCompleted())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
