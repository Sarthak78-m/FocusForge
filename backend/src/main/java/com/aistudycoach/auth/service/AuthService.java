package com.aistudycoach.auth.service;

import com.aistudycoach.auth.dto.AuthenticationRequest;
import com.aistudycoach.auth.dto.AuthenticationResponse;
import com.aistudycoach.auth.dto.EmailRequest;
import com.aistudycoach.auth.dto.RegistrationResponse;
import com.aistudycoach.auth.dto.RegisterRequest;
import com.aistudycoach.auth.dto.ResetPasswordRequest;
import com.aistudycoach.auth.dto.UserResponse;
import com.aistudycoach.auth.token.EmailVerificationToken;
import com.aistudycoach.auth.token.PasswordResetToken;
import com.aistudycoach.exception.EmailAlreadyExistsException;
import com.aistudycoach.exception.EmailNotVerifiedException;
import com.aistudycoach.exception.InvalidVerificationTokenException;
import com.aistudycoach.repository.EmailVerificationTokenRepository;
import com.aistudycoach.repository.PasswordResetTokenRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.security.JwtService;
import com.aistudycoach.user.Role;
import com.aistudycoach.user.User;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecureTokenService secureTokenService;
    private final EmailAddressValidationService emailAddressValidationService;
    private final EmailService emailService;
    private final AuthRateLimiter authRateLimiter;

    @Value("${auth.email.verification-expiration-minutes:30}")
    private long verificationExpirationMinutes;

    @Value("${auth.password-reset.expiration-minutes:30}")
    private long passwordResetExpirationMinutes;

    @Transactional
    public RegistrationResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String email = emailAddressValidationService.normalizeAndValidateForRegistration(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        issueEmailVerification(savedUser);

        return RegistrationResponse.builder()
                .email(savedUser.getEmail())
                .emailVerificationRequired(true)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthenticationResponse login(AuthenticationRequest request, String clientAddress) {
        String email = emailAddressValidationService.normalize(request.getEmail());
        String rateLimitKey = email + ":" + clientAddress;
        authRateLimiter.assertLoginAllowed(rateLimitKey);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            authRateLimiter.recordLoginFailure(rateLimitKey);
            throw new BadCredentialsException("Invalid email or password", ex);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        authRateLimiter.resetLoginFailures(rateLimitKey);
        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Please verify your email before logging in.");
        }

        return AuthenticationResponse.builder()
                .token(jwtService.generateToken(user))
                .build();
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        EmailVerificationToken token = emailVerificationTokenRepository
                .findByTokenHashAndUsedAtIsNull(secureTokenService.hash(rawToken))
                .orElseThrow(this::invalidVerificationToken);

        if (!token.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw invalidVerificationToken();
        }

        token.setUsedAt(LocalDateTime.now());
        token.getUser().setEmailVerified(true);
    }

    @Transactional
    public void resendVerification(EmailRequest request) {
        String email = emailAddressValidationService.normalize(request.getEmail());
        userRepository.findByEmail(email)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(user -> {
                    authRateLimiter.acquireResendPermission(email);
                    issueEmailVerification(user);
                });
    }

    @Transactional
    public void forgotPassword(EmailRequest request) {
        String email = emailAddressValidationService.normalize(request.getEmail());
        userRepository.findByEmail(email).ifPresent(user -> {
            authRateLimiter.acquirePasswordResetPermission(email);
            issuePasswordReset(user);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        PasswordResetToken token = passwordResetTokenRepository
                .findByTokenHashAndUsedAtIsNull(secureTokenService.hash(request.getToken()))
                .orElseThrow(this::invalidPasswordResetToken);

        if (!token.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw invalidPasswordResetToken();
        }

        token.getUser().setPassword(passwordEncoder.encode(request.getPassword()));
        token.setUsedAt(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Authentication is required"));

        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private void issueEmailVerification(User user) {
        LocalDateTime now = LocalDateTime.now();
        emailVerificationTokenRepository.invalidateActiveTokensForUser(user, now);

        String rawToken = secureTokenService.generateToken();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(user)
                .tokenHash(secureTokenService.hash(rawToken))
                .expiresAt(now.plusMinutes(verificationExpirationMinutes))
                .build();
        emailVerificationTokenRepository.save(token);
        emailService.sendVerificationEmail(user, rawToken);
    }

    private void issuePasswordReset(User user) {
        LocalDateTime now = LocalDateTime.now();
        passwordResetTokenRepository.invalidateActiveTokensForUser(user, now);

        String rawToken = secureTokenService.generateToken();
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash(secureTokenService.hash(rawToken))
                .expiresAt(now.plusMinutes(passwordResetExpirationMinutes))
                .build();
        passwordResetTokenRepository.save(token);
        emailService.sendPasswordResetEmail(user, rawToken);
    }

    private InvalidVerificationTokenException invalidVerificationToken() {
        return new InvalidVerificationTokenException("Verification link is invalid, expired, or already used");
    }

    private InvalidVerificationTokenException invalidPasswordResetToken() {
        return new InvalidVerificationTokenException("Password reset link is invalid, expired, or already used");
    }
}
