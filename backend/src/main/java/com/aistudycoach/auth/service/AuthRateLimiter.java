package com.aistudycoach.auth.service;

import com.aistudycoach.exception.TooManyRequestsException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthRateLimiter {

    private final ConcurrentMap<String, LoginAttemptState> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Instant> resendRequests = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Instant> passwordResetRequests = new ConcurrentHashMap<>();

    @Value("${auth.login.max-attempts:5}")
    private int maxLoginAttempts;

    @Value("${auth.login.window-seconds:900}")
    private long loginWindowSeconds;

    @Value("${auth.login.lockout-seconds:900}")
    private long loginLockoutSeconds;

    @Value("${auth.email.resend-cooldown-seconds:60}")
    private long resendCooldownSeconds;

    @Value("${auth.password-reset.cooldown-seconds:60}")
    private long passwordResetCooldownSeconds;

    public void assertLoginAllowed(String key) {
        LoginAttemptState state = loginAttempts.get(key);
        if (state == null || state.lockedUntil == null || !state.lockedUntil.isAfter(Instant.now())) {
            return;
        }

        throw rateLimitException("Too many login attempts. Please try again later.", state.lockedUntil);
    }

    public void recordLoginFailure(String key) {
        Instant now = Instant.now();
        loginAttempts.compute(key, (ignored, current) -> {
            LoginAttemptState state = current == null || current.windowStarted.plusSeconds(loginWindowSeconds).isBefore(now)
                    ? new LoginAttemptState(now, 0, null)
                    : current;
            state.failures++;
            if (state.failures >= maxLoginAttempts) {
                state.lockedUntil = now.plusSeconds(loginLockoutSeconds);
            }
            return state;
        });
    }

    public void resetLoginFailures(String key) {
        loginAttempts.remove(key);
    }

    public void acquireResendPermission(String email) {
        acquireCooldown(
                resendRequests,
                email,
                resendCooldownSeconds,
                "Please wait before requesting another verification email."
        );
    }

    public void acquirePasswordResetPermission(String email) {
        acquireCooldown(
                passwordResetRequests,
                email,
                passwordResetCooldownSeconds,
                "Please wait before requesting another password reset email."
        );
    }

    private void acquireCooldown(
            ConcurrentMap<String, Instant> requests,
            String key,
            long cooldownSeconds,
            String message
    ) {
        Instant now = Instant.now();
        AtomicBoolean granted = new AtomicBoolean(false);
        Instant lastRequestAt = requests.compute(key, (ignored, previousRequestAt) -> {
            if (previousRequestAt != null && previousRequestAt.plusSeconds(cooldownSeconds).isAfter(now)) {
                return previousRequestAt;
            }
            granted.set(true);
            return now;
        });

        if (!granted.get()) {
            throw rateLimitException(message, lastRequestAt.plusSeconds(cooldownSeconds));
        }
    }

    private TooManyRequestsException rateLimitException(String message, Instant retryAt) {
        long retryAfterSeconds = Math.max(1, Duration.between(Instant.now(), retryAt).toSeconds());
        return new TooManyRequestsException(message, retryAfterSeconds);
    }

    private static final class LoginAttemptState {

        private final Instant windowStarted;
        private int failures;
        private Instant lockedUntil;

        private LoginAttemptState(Instant windowStarted, int failures, Instant lockedUntil) {
            this.windowStarted = windowStarted;
            this.failures = failures;
            this.lockedUntil = lockedUntil;
        }
    }
}
