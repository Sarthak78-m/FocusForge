package com.mindsprint.reward;

import com.mindsprint.analytics.AnalyticsService;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardTransactionRepository rewardTransactionRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final AnalyticsService analyticsService;

    @Transactional
    public void handleSessionCompleted(User user, Long sessionId) {
        String refId = "pomodoro:" + sessionId;
        if (rewardTransactionRepository.existsByUserAndEventTypeAndReferenceId(user, RewardEventType.FOCUS_SESSION_COMPLETED, refId)) {
            log.info("Reward already granted for session {}", sessionId);
            return;
        }

        awardXp(user, RewardEventType.FOCUS_SESSION_COMPLETED, 10, refId);
        evaluateAchievements(user);
    }

    @Transactional
    public void handleGoalCompleted(User user, Long goalId) {
        String refId = "goal:" + goalId;
        if (rewardTransactionRepository.existsByUserAndEventTypeAndReferenceId(user, RewardEventType.GOAL_COMPLETED, refId)) {
            log.info("Reward already granted for goal {}", goalId);
            return;
        }

        awardXp(user, RewardEventType.GOAL_COMPLETED, 25, refId);
        evaluateAchievements(user);
    }

    private void awardXp(User user, RewardEventType eventType, int xpAmount, String referenceId) {
        RewardTransaction transaction = RewardTransaction.builder()
                .user(user)
                .eventType(eventType)
                .xpAmount(xpAmount)
                .referenceId(referenceId)
                .build();
        
        rewardTransactionRepository.save(transaction);
        
        user.setXp(user.getXp() + xpAmount);
        
        int newLevel = LevelConfig.calculateLevelFromXp(user.getXp());
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }
        
        userRepository.save(user);
    }

    private void evaluateAchievements(User user) {
        if (!userAchievementRepository.existsByUserAndAchievementType(user, AchievementType.FIRST_SESSION)) {
            long completedSessions = pomodoroSessionRepository.countByUserIdAndStatus(user.getId(), com.mindsprint.pomodoro.SessionStatus.COMPLETED);
            if (completedSessions >= 1) {
                grantAchievement(user, AchievementType.FIRST_SESSION, 50);
            }
        }
        
        if (!userAchievementRepository.existsByUserAndAchievementType(user, AchievementType.TEN_SESSIONS)) {
            long completedSessions = pomodoroSessionRepository.countByUserIdAndStatus(user.getId(), com.mindsprint.pomodoro.SessionStatus.COMPLETED);
            if (completedSessions >= 10) {
                grantAchievement(user, AchievementType.TEN_SESSIONS, 100);
            }
        }
        
        if (!userAchievementRepository.existsByUserAndAchievementType(user, AchievementType.FIRST_GOAL)) {
            boolean hasCompletedGoal = rewardTransactionRepository.existsByUserAndEventTypeAndReferenceIdStartingWith(user, RewardEventType.GOAL_COMPLETED, "goal:");
            if (hasCompletedGoal) {
                grantAchievement(user, AchievementType.FIRST_GOAL, 50);
            }
        }
    }

    private void grantAchievement(User user, AchievementType achievementType, int bonusXp) {
        UserAchievement achievement = UserAchievement.builder()
                .user(user)
                .achievementType(achievementType)
                .build();
        userAchievementRepository.save(achievement);
        
        awardXp(user, RewardEventType.ACHIEVEMENT_UNLOCKED, bonusXp, "achievement:" + achievementType.name());
    }

    @Transactional(readOnly = true)
    public com.mindsprint.reward.dto.RewardSummaryResponse getSummary(org.springframework.security.core.Authentication authentication) {
        User user = getUser(authentication);
        int currentXp = user.getXp();
        int level = user.getLevel();
        int nextLevelXp = LevelConfig.getRequiredXpForLevel(level + 1);

        return com.mindsprint.reward.dto.RewardSummaryResponse.builder()
                .currentXp(currentXp)
                .level(level)
                .nextLevelXp(nextLevelXp)
                .title("Level " + level)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RewardTransaction> getHistory(org.springframework.security.core.Authentication authentication) {
        User user = getUser(authentication);
        return rewardTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public List<UserAchievement> getAchievements(org.springframework.security.core.Authentication authentication) {
        User user = getUser(authentication);
        return userAchievementRepository.findByUserIdOrderByEarnedAtDesc(user.getId());
    }

    private User getUser(org.springframework.security.core.Authentication authentication) {
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new com.mindsprint.exception.ResourceNotFoundException("User not found"));
    }
}
