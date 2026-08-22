package com.mindsprint.reward;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.pomodoro.SessionStatus;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {

    private static final int FOCUS_SESSION_XP = 10;
    private static final int GOAL_COMPLETED_XP = 25;
    private static final int FIRST_SESSION_XP = 50;
    private static final int TEN_SESSIONS_XP = 100;
    private static final int FIRST_GOAL_XP = 50;

    private final RewardTransactionRepository rewardTransactionRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;

    @Transactional
    public void handleSessionCompleted(User user, Long sessionId) {
        processEvent(
                user.getId(),
                RewardEventType.FOCUS_SESSION_COMPLETED,
                FOCUS_SESSION_XP,
                "pomodoro:" + sessionId
        );
    }

    @Transactional
    public void handleGoalCompleted(User user, Long goalId) {
        processEvent(
                user.getId(),
                RewardEventType.GOAL_COMPLETED,
                GOAL_COMPLETED_XP,
                "goal:" + goalId
        );
    }

    /**
     * Locking the user serializes reward writes for that user. The unique
     * database constraint remains the final duplicate-event guard.
     */
    private void processEvent(Long userId, RewardEventType eventType, int xpAmount, String referenceId) {
        User managedUser = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!recordRewardIfAbsent(managedUser, eventType, xpAmount, referenceId)) {
            synchronizeXp(managedUser);
            return;
        }

        evaluateAchievements(managedUser);
        synchronizeXp(managedUser);
    }

    private boolean recordRewardIfAbsent(
            User user,
            RewardEventType eventType,
            int xpAmount,
            String referenceId
    ) {
        if (rewardTransactionRepository.existsByUserAndEventTypeAndReferenceId(user, eventType, referenceId)) {
            log.debug("Reward {} for {} already exists", eventType, referenceId);
            return false;
        }

        rewardTransactionRepository.saveAndFlush(RewardTransaction.builder()
                .user(user)
                .eventType(eventType)
                .xpAmount(xpAmount)
                .referenceId(referenceId)
                .build());
        return true;
    }

    private void evaluateAchievements(User user) {
        long completedSessions = pomodoroSessionRepository.countByUserIdAndStatus(user.getId(), SessionStatus.COMPLETED);
        if (completedSessions >= 1) {
            grantAchievementIfAbsent(user, AchievementType.FIRST_SESSION, FIRST_SESSION_XP);
        }
        if (completedSessions >= 10) {
            grantAchievementIfAbsent(user, AchievementType.TEN_SESSIONS, TEN_SESSIONS_XP);
        }
        if (rewardTransactionRepository.existsByUserAndEventTypeAndReferenceIdStartingWith(
                user,
                RewardEventType.GOAL_COMPLETED,
                "goal:"
        )) {
            grantAchievementIfAbsent(user, AchievementType.FIRST_GOAL, FIRST_GOAL_XP);
        }
    }

    private void grantAchievementIfAbsent(User user, AchievementType achievementType, int bonusXp) {
        if (userAchievementRepository.existsByUserAndAchievementType(user, achievementType)) {
            return;
        }

        userAchievementRepository.saveAndFlush(UserAchievement.builder()
                .user(user)
                .achievementType(achievementType)
                .build());
        recordRewardIfAbsent(
                user,
                RewardEventType.ACHIEVEMENT_UNLOCKED,
                bonusXp,
                "achievement:" + achievementType.name()
        );
    }

    private void synchronizeXp(User user) {
        int totalXp = calculateTotalXp(user.getId());
        user.setXp(totalXp);
        user.setLevel(LevelConfig.calculateLevelFromXp(totalXp));
        userRepository.saveAndFlush(user);
    }

    private int calculateTotalXp(Long userId) {
        Integer totalXp = rewardTransactionRepository.sumXpAmountByUserId(userId);
        return totalXp == null ? 0 : totalXp;
    }

    @Transactional(readOnly = true)
    public com.mindsprint.reward.dto.RewardSummaryResponse getSummary(Authentication authentication) {
        User user = getUser(authentication);
        int currentXp = calculateTotalXp(user.getId());
        int level = LevelConfig.calculateLevelFromXp(currentXp);
        int nextLevelXp = LevelConfig.getRequiredXpForLevel(level + 1);

        return com.mindsprint.reward.dto.RewardSummaryResponse.builder()
                .currentXp(currentXp)
                .level(level)
                .nextLevelXp(nextLevelXp)
                .title("Level " + level)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RewardTransaction> getHistory(Authentication authentication) {
        return rewardTransactionRepository.findByUserIdOrderByCreatedAtDesc(getUser(authentication).getId());
    }

    @Transactional(readOnly = true)
    public List<UserAchievement> getAchievements(Authentication authentication) {
        return userAchievementRepository.findByUserIdOrderByEarnedAtDesc(getUser(authentication).getId());
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
