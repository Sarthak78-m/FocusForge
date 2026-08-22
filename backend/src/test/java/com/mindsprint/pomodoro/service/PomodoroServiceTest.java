package com.mindsprint.pomodoro.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.mindsprint.pomodoro.PomodoroSession;
import com.mindsprint.pomodoro.PomodoroSessionType;
import com.mindsprint.pomodoro.SessionStatus;
import com.mindsprint.pomodoro.dto.PomodoroSessionResponse;
import com.mindsprint.pomodoro.dto.StartSessionRequest;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.reward.RewardEventType;
import com.mindsprint.reward.RewardTransactionRepository;
import com.mindsprint.reward.UserAchievementRepository;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PomodoroServiceTest {

    private static final String ACTIVE_SESSION_KEY = "STARTED";

    @Autowired
    private PomodoroService pomodoroService;

    @Autowired
    private PomodoroSessionRepository pomodoroSessionRepository;

    @Autowired
    private RewardTransactionRepository rewardTransactionRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        clearData();
        testUser = userRepository.save(User.builder()
                .name("Pomodoro Test User")
                .email("pomodoro-test@mindsprint.com")
                .password("password")
                .role(Role.USER)
                .emailVerified(true)
                .build());
        authentication = new UsernamePasswordAuthenticationToken(testUser.getEmail(), null, List.of());
    }

    @AfterEach
    void tearDown() {
        clearData();
    }

    @Test
    void reconcilesExpiredFocusSessionAndAwardsExactlyOnce() {
        PomodoroSession expired = createStartedSession(PomodoroSessionType.FOCUS, 25, LocalDateTime.now().minusMinutes(30));

        PomodoroSessionResponse response = pomodoroService.restoreSession(authentication);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(response.getActualDuration()).isGreaterThanOrEqualTo(25);
        PomodoroSession persisted = pomodoroSessionRepository.findById(expired.getId()).orElseThrow();
        assertThat(persisted.getEndedAt()).isNotNull();
        assertThat(persisted.getActiveSessionKey()).isNull();
        assertThat(baseFocusRewardCount()).isEqualTo(1);
    }

    @Test
    void reconcilesExpiredBreakSessionWithoutAwardingXp() {
        PomodoroSession expired = createStartedSession(PomodoroSessionType.SHORT_BREAK, 5, LocalDateTime.now().minusMinutes(10));

        PomodoroSessionResponse response = pomodoroService.restoreSession(authentication);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(pomodoroSessionRepository.findById(expired.getId()).orElseThrow().getActualDuration())
                .isGreaterThanOrEqualTo(5);
        assertThat(rewardTransactionRepository.count()).isZero();
        assertThat(userRepository.findById(testUser.getId()).orElseThrow().getXp()).isZero();
    }

    @Test
    void refreshAfterExpiryDoesNotLeaveStartedSessionOrDuplicateRewards() {
        createStartedSession(PomodoroSessionType.FOCUS, 25, LocalDateTime.now().minusMinutes(30));

        PomodoroSessionResponse firstRestore = pomodoroService.restoreSession(authentication);
        PomodoroSessionResponse refreshRestore = pomodoroService.restoreSession(authentication);

        assertThat(firstRestore).isNotNull();
        assertThat(firstRestore.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(refreshRestore).isNull();
        assertThat(pomodoroSessionRepository.countByUserIdAndStatus(testUser.getId(), SessionStatus.STARTED)).isZero();
        assertThat(baseFocusRewardCount()).isEqualTo(1);
    }

    @Test
    void concurrentRestoresReconcileOnlyOnce() throws Exception {
        createStartedSession(PomodoroSessionType.FOCUS, 25, LocalDateTime.now().minusMinutes(30));

        List<PomodoroSessionResponse> responses = callConcurrently(2, () -> pomodoroService.restoreSession(authentication));

        assertThat(responses).anySatisfy(response -> assertThat(response).isNotNull());
        assertThat(pomodoroSessionRepository.countByUserIdAndStatus(testUser.getId(), SessionStatus.STARTED)).isZero();
        assertThat(baseFocusRewardCount()).isEqualTo(1);
    }

    @Test
    void concurrentStartRequestsCreateOnlyOneStartedSession() throws Exception {
        StartSessionRequest request = StartSessionRequest.builder()
                .plannedDuration(25)
                .sessionType(PomodoroSessionType.FOCUS)
                .build();

        List<PomodoroSessionResponse> responses = callConcurrently(2, () -> pomodoroService.startSession(authentication, request));

        assertThat(responses).allSatisfy(response -> assertThat(response.getStatus()).isEqualTo(SessionStatus.STARTED));
        assertThat(responses).extracting(PomodoroSessionResponse::getId).containsOnly(responses.getFirst().getId());
        assertThat(pomodoroSessionRepository.countByUserIdAndStatus(testUser.getId(), SessionStatus.STARTED)).isEqualTo(1);
    }

    @Test
    void concurrentCompletionRequestsCompleteAndRewardOnlyOnce() throws Exception {
        PomodoroSessionResponse started = pomodoroService.startSession(authentication, StartSessionRequest.builder()
                .plannedDuration(25)
                .sessionType(PomodoroSessionType.FOCUS)
                .build());

        List<PomodoroSessionResponse> responses = callConcurrently(
                2,
                () -> pomodoroService.completeSession(authentication, started.getId(), 25)
        );

        assertThat(responses).allSatisfy(response -> assertThat(response.getStatus()).isEqualTo(SessionStatus.COMPLETED));
        assertThat(pomodoroSessionRepository.countByUserIdAndStatus(testUser.getId(), SessionStatus.COMPLETED)).isEqualTo(1);
        assertThat(baseFocusRewardCount()).isEqualTo(1);
    }

    private PomodoroSession createStartedSession(
            PomodoroSessionType sessionType,
            int plannedDuration,
            LocalDateTime startedAt
    ) {
        return pomodoroSessionRepository.saveAndFlush(PomodoroSession.builder()
                .user(testUser)
                .sessionType(sessionType)
                .plannedDuration(plannedDuration)
                .status(SessionStatus.STARTED)
                .activeSessionKey(ACTIVE_SESSION_KEY)
                .startedAt(startedAt)
                .build());
    }

    private long baseFocusRewardCount() {
        return rewardTransactionRepository.findAll().stream()
                .filter(reward -> reward.getEventType() == RewardEventType.FOCUS_SESSION_COMPLETED)
                .count();
    }

    private <T> List<T> callConcurrently(int count, ThrowingSupplier<T> operation) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(count);
        CyclicBarrier barrier = new CyclicBarrier(count);
        try {
            List<Future<T>> futures = new ArrayList<>();
            for (int index = 0; index < count; index++) {
                futures.add(executor.submit(() -> {
                    barrier.await();
                    return operation.get();
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
}
