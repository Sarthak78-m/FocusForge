package com.mindsprint.reward;

import com.mindsprint.user.User;
import com.mindsprint.user.Role;
import com.mindsprint.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
    private UserRepository userRepository;
    
    @Autowired
    private PlatformTransactionManager transactionManager;

    private User testUser;

    @BeforeEach
    void setUp() {
        rewardTransactionRepository.deleteAll();
        userAchievementRepository.deleteAll();
        userRepository.deleteAll();

        User user = User.builder()
                .name("Test User")
                .email("test@mindsprint.com")
                .password("password")
                .role(Role.USER)
                .xp(0)
                .level(1)
                .build();
        testUser = userRepository.save(user);
    }

    @AfterEach
    void tearDown() {
        rewardTransactionRepository.deleteAll();
        userAchievementRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldBeIdempotent_WhenHandlingSessionCompleted_CalledMultipleTimes() {
        // Given
        Long sessionId = 100L;

        // When
        rewardService.handleSessionCompleted(testUser, sessionId);
        rewardService.handleSessionCompleted(testUser, sessionId);
        rewardService.handleSessionCompleted(testUser, sessionId);

        // Then
        long count = rewardTransactionRepository.count();
        assertThat(count).isEqualTo(1); // Only 1 transaction for base XP (or 2 if achievement unlocked)
        
        long baseXpCount = rewardTransactionRepository.findAll().stream()
                .filter(t -> t.getEventType() == RewardEventType.FOCUS_SESSION_COMPLETED)
                .count();
        assertThat(baseXpCount).isEqualTo(1);
    }

    @Test
    void shouldHandleConcurrentDuplication_Safely() throws InterruptedException {
        // Given
        Long sessionId = 200L;
        int threads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failureCount = new AtomicInteger();

        // When
        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    rewardService.handleSessionCompleted(testUser, sessionId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();
        executor.shutdown();

        // Then
        // Because of idempotency check, only one thread should actually insert it.
        // Some might throw exception if they pass the IF check simultaneously but fail at DB unique constraint.
        // Or all succeed because they return early.
        long baseXpCount = rewardTransactionRepository.findAll().stream()
                .filter(t -> t.getEventType() == RewardEventType.FOCUS_SESSION_COMPLETED)
                .count();
        assertThat(baseXpCount).isEqualTo(1);
    }
    
    @Test
    void shouldRollback_WhenExceptionOccurs() {
        // Assuming we can force a failure by passing a non-existent user or we can manually wrap in tx
        TransactionStatus status = transactionManager.getTransaction(new DefaultTransactionDefinition());
        try {
            rewardService.handleSessionCompleted(testUser, 300L);
            
            // simulate a failure
            throw new RuntimeException("Simulated failure after reward");
        } catch (RuntimeException e) {
            transactionManager.rollback(status);
        }
        
        // Then
        long count = rewardTransactionRepository.count();
        assertThat(count).isEqualTo(0);
        
        User updatedUser = userRepository.findById(testUser.getId()).get();
        assertThat(updatedUser.getXp()).isEqualTo(0);
    }
}
