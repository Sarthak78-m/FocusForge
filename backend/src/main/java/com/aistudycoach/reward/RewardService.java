package com.aistudycoach.reward;

import com.aistudycoach.exception.ResourceNotFoundException;
import com.aistudycoach.repository.GoalRepository;
import com.aistudycoach.repository.TaskRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.reward.dto.RewardSummaryResponse;
import com.aistudycoach.reward.dto.RewardSummaryResponse.BadgeDto;
import com.aistudycoach.study.PomodoroSession;
import com.aistudycoach.study.PomodoroSessionRepository;
import com.aistudycoach.task.TaskStatus;
import com.aistudycoach.user.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final GoalRepository goalRepository;

    @Transactional(readOnly = true)
    public RewardSummaryResponse getRewards(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int completedTasks = (int) taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.COMPLETED);
        int totalWorkMinutes = pomodoroSessionRepository.sumTotalWorkMinutes(user);
        long workSessions = pomodoroSessionRepository.countByUserAndSessionType(user, PomodoroSession.SessionType.WORK);

        // Compute XP based on real progress
        int currentXp = (completedTasks * 50) + ((int) workSessions * 100) + (totalWorkMinutes / 25 * 20);
        int level = Math.max(1, (currentXp / 500) + 1);
        int nextLevelXp = level * 500;

        List<BadgeDto> badges = List.of(
                BadgeDto.builder()
                        .id("b1")
                        .name("First Sprint Champion")
                        .description("Completed your first Pomodoro focus sprint")
                        .icon("⚡")
                        .unlocked(workSessions >= 1)
                        .unlockedAt(workSessions >= 1 ? "Achieved" : null)
                        .build(),
                BadgeDto.builder()
                        .id("b2")
                        .name("Task Completer")
                        .description("Completed at least 5 study tasks")
                        .icon("✓")
                        .unlocked(completedTasks >= 5)
                        .unlockedAt(completedTasks >= 5 ? "Achieved" : null)
                        .build(),
                BadgeDto.builder()
                        .id("b3")
                        .name("Focus Sprint Master")
                        .description("Completed 4 deep work focus sessions")
                        .icon("⏱️")
                        .unlocked(workSessions >= 4)
                        .unlockedAt(workSessions >= 4 ? "Achieved" : null)
                        .build(),
                BadgeDto.builder()
                        .id("b4")
                        .name("Task Crusher")
                        .description("Completed 15 study tasks in your workspace")
                        .icon("🎯")
                        .unlocked(completedTasks >= 15)
                        .unlockedAt(completedTasks >= 15 ? "Achieved" : null)
                        .build(),
                BadgeDto.builder()
                        .id("b5")
                        .name("Deep Work Champion")
                        .description("Completed 10 total Pomodoro focus sessions")
                        .icon("🏆")
                        .unlocked(workSessions >= 10)
                        .unlockedAt(workSessions >= 10 ? "Achieved" : null)
                        .build()
        );

        int streakDays = workSessions > 0 ? Math.min(30, (int) workSessions) : (completedTasks > 0 ? 1 : 0);

        return RewardSummaryResponse.builder()
                .currentXp(currentXp)
                .level(level)
                .title("Scholar Level " + level)
                .nextLevelXp(nextLevelXp)
                .streakDays(streakDays)
                .badges(badges)
                .build();
    }
}
