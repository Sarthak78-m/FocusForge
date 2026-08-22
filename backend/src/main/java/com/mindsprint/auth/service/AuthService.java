package com.mindsprint.auth.service;

import com.mindsprint.auth.dto.AuthenticationRequest;
import com.mindsprint.auth.dto.AuthenticationResponse;
import com.mindsprint.auth.dto.EmailRequest;
import com.mindsprint.auth.dto.RegistrationResponse;
import com.mindsprint.auth.dto.RegisterRequest;
import com.mindsprint.auth.dto.ResetPasswordRequest;
import com.mindsprint.auth.dto.UpdatePhoneRequest;
import com.mindsprint.auth.dto.UserResponse;
import com.mindsprint.auth.token.EmailVerificationToken;
import com.mindsprint.auth.token.PasswordResetToken;
import com.mindsprint.exception.EmailAlreadyExistsException;
import com.mindsprint.exception.EmailNotVerifiedException;
import com.mindsprint.exception.InvalidVerificationTokenException;
import com.mindsprint.repository.EmailVerificationTokenRepository;
import com.mindsprint.repository.PasswordResetTokenRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.security.JwtService;
import com.mindsprint.user.Role;
import com.mindsprint.user.User;
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

    @Value("${auth.email.verification-required:false}")
    private boolean verificationRequired;

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

        boolean isAutoVerify = !verificationRequired || !emailService.isEmailConfigured() || emailService.isDevelopmentProfile();

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .emailVerified(isAutoVerify)
                .build();

        User savedUser = userRepository.save(user);

        if (!isAutoVerify) {
            issueEmailVerification(savedUser);
        }

        return RegistrationResponse.builder()
                .email(savedUser.getEmail())
                .emailVerificationRequired(!isAutoVerify)
                .build();
    }

    @Transactional
    public AuthenticationResponse login(AuthenticationRequest request, String clientAddress) {
        String email = emailAddressValidationService.normalize(request.getEmail());
        String rateLimitKey = email + ":" + clientAddress;
        authRateLimiter.assertLoginAllowed(rateLimitKey);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            authRateLimiter.recordLoginFailure(rateLimitKey);
            throw new BadCredentialsException("Invalid email or password", ex);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        authRateLimiter.resetLoginFailures(rateLimitKey);
        if (!user.isEmailVerified()) {
            boolean canAutoVerify = !verificationRequired || !emailService.isEmailConfigured() || emailService.isDevelopmentProfile() || !emailVerificationTokenRepository.existsByUser(user);
            if (canAutoVerify) {
                user.setEmailVerified(true);
                userRepository.save(user);
            } else {
                throw new EmailNotVerifiedException("Please verify your email before logging in.");
            }
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
        emailService.sendWelcomeEmail(token.getUser());
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
        token.getUser().setEmailVerified(true);
        token.setUsedAt(LocalDateTime.now());
        emailService.sendPasswordChangedNotification(token.getUser());
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

    @Transactional
    public UserResponse updatePhone(Authentication authentication, UpdatePhoneRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Authentication is required"));

        user.setPhoneNumber(request.getPhoneNumber());
        user.setPhoneNotificationsEnabled(request.isPhoneNotificationsEnabled());
        User saved = userRepository.save(user);

        return toUserResponse(saved);
    }

    @Transactional
    public UserResponse updateProfile(Authentication authentication, com.mindsprint.auth.dto.UpdateProfileRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Authentication is required"));

        user.setName(request.getName().trim());
        User saved = userRepository.save(user);

        return toUserResponse(saved);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .maskedPhoneNumber(com.mindsprint.config.PhoneCryptoConverter.maskPhoneNumber(user.getPhoneNumber()))
                .phoneNotificationsEnabled(user.isPhoneNotificationsEnabled())
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
