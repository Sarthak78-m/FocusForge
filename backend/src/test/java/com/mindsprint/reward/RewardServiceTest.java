package com.mindsprint.reward;

import static org.assertj.core.api.Assertions.assertThat;

import com.mindsprint.pomodoro.PomodoroSession;
import com.mindsprint.pomodoro.PomodoroSessionType;
import com.mindsprint.pomodoro.SessionStatus;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.Role;
import com.mindsprint.user.User;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

@SpringBootTest
@ActiveProfiles("test")
class RewardServiceTest {

    @Autowired
    private RewardService rewardService;

    @Autowired
    private RewardTransactionRepository rewardTransactionRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private PomodoroSessionRepository pomodoroSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private User testUser;

    @BeforeEach
    void setUp() {
        clearData();
        testUser = userRepository.save(User.builder()
                .name("Reward Test User")
                .email("reward-test@mindsprint.com")
                .password("password")
                .role(Role.USER)
                .emailVerified(true)
                .build());
    }

    @AfterEach
    void tearDown() {
        clearData();
    }

    @Test
    void duplicateRewardEventIsIdempotent() {
        rewardService.handleSessionCompleted(testUser, 100L);
        rewardService.handleSessionCompleted(testUser, 100L);

        assertThat(rewardCount(RewardEventType.FOCUS_SESSION_COMPLETED, "pomodoro:100")).isEqualTo(1);
        assertXpMatchesRewardTransactions();
    }

    @Test
    void concurrentDuplicateRewardEventsDoNotFailOrDoubleAwardXp() throws Exception {
        callConcurrently(2, () -> {
            rewardService.handleSessionCompleted(testUser, 200L);
            return null;
        });

        assertThat(rewardCount(RewardEventType.FOCUS_SESSION_COMPLETED, "pomodoro:200")).isEqualTo(1);
        assertXpMatchesRewardTransactions();
    }

    @Test
    void userXpEqualsRewardTransactionSumAfterConcurrentDifferentEvents() throws Exception {
        callConcurrently(5, new IndexedOperation<Void>() {
            @Override
            public Void get(int index) {
                rewardService.handleSessionCompleted(testUser, 300L + index);
                return null;
            }
        });

        assertThat(rewardTransactionRepository.findAll().stream()
                .filter(reward -> reward.getEventType() == RewardEventType.FOCUS_SESSION_COMPLETED)
                .count()).isEqualTo(5);
        assertXpMatchesRewardTransactions();
    }

    @Test
    void achievementBonusIsRecordedWithoutRecursiveRewardProcessing() {
        PomodoroSession completed = pomodoroSessionRepository.saveAndFlush(PomodoroSession.builder()
                .user(testUser)
                .sessionType(PomodoroSessionType.FOCUS)
                .plannedDuration(25)
                .actualDuration(25)
                .status(SessionStatus.COMPLETED)
                .startedAt(LocalDateTime.now().minusMinutes(25))
                .endedAt(LocalDateTime.now())
                .build());

        rewardService.handleSessionCompleted(testUser, completed.getId());

        assertThat(userAchievementRepository.findAll()).extracting(UserAchievement::getAchievementType)
                .containsExactly(AchievementType.FIRST_SESSION);
        assertThat(rewardCount(RewardEventType.ACHIEVEMENT_UNLOCKED, "achievement:FIRST_SESSION")).isEqualTo(1);
        assertThat(rewardTransactionRepository.findAll()).hasSize(2);
        assertXpMatchesRewardTransactions();
    }

    @Test
    void rewardAndXpRollbackTogetherWithTheEnclosingTransaction() {
        TransactionStatus transaction = transactionManager.getTransaction(new DefaultTransactionDefinition());
        try {
            rewardService.handleSessionCompleted(testUser, 400L);
        } finally {
            transactionManager.rollback(transaction);
        }

        assertThat(rewardTransactionRepository.count()).isZero();
        assertThat(userRepository.findById(testUser.getId()).orElseThrow().getXp()).isZero();
    }

    private long rewardCount(RewardEventType eventType, String referenceId) {
        return rewardTransactionRepository.findAll().stream()
                .filter(reward -> reward.getEventType() == eventType)
                .filter(reward -> reward.getReferenceId().equals(referenceId))
                .count();
    }

    private void assertXpMatchesRewardTransactions() {
        int transactionXp = rewardTransactionRepository.sumXpAmountByUserId(testUser.getId());
        int userXp = userRepository.findById(testUser.getId()).orElseThrow().getXp();
        assertThat(userXp).isEqualTo(transactionXp);
    }

    private <T> List<T> callConcurrently(int count, ThrowingSupplier<T> operation) throws Exception {
        return callConcurrently(count, index -> operation.get());
    }

    private <T> List<T> callConcurrently(int count, IndexedOperation<T> operation) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(count);
        CyclicBarrier barrier = new CyclicBarrier(count);
        try {
            List<Future<T>> futures = new ArrayList<>();
            for (int index = 0; index < count; index++) {
                int operationIndex = index;
                futures.add(executor.submit(() -> {
                    barrier.await();
                    return operation.get(operationIndex);
                }));
            }

            List<T> results = new ArrayList<>();
            for (Future<T> future : futures) {
                results.add(future.get());
            }
            return results;
        } finally {
            executor.shutdownNow();
        }
    }

    private void clearData() {
        rewardTransactionRepository.deleteAll();
        userAchievementRepository.deleteAll();
        pomodoroSessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @FunctionalInterface
    private interface ThrowingSupplier<T> {
        T get() throws Exception;
    }

    @FunctionalInterface
    private interface IndexedOperation<T> {
        T get(int index) throws Exception;
    }
}
