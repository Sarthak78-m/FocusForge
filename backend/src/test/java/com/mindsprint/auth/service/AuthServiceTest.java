package com.mindsprint.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mindsprint.auth.dto.AuthenticationRequest;
import com.mindsprint.auth.dto.AuthenticationResponse;
import com.mindsprint.auth.dto.RegisterRequest;
import com.mindsprint.auth.dto.RegistrationResponse;
import com.mindsprint.exception.EmailNotVerifiedException;
import com.mindsprint.repository.EmailVerificationTokenRepository;
import com.mindsprint.repository.PasswordResetTokenRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.security.JwtService;
import com.mindsprint.user.Role;
import com.mindsprint.user.User;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private SecureTokenService secureTokenService;
    @Mock private EmailAddressValidationService emailAddressValidationService;
    @Mock private EmailService emailService;
    @Mock private AuthRateLimiter authRateLimiter;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                authenticationManager,
                emailVerificationTokenRepository,
                passwordResetTokenRepository,
                secureTokenService,
                emailAddressValidationService,
                emailService,
                authRateLimiter
        );
        ReflectionTestUtils.setField(authService, "verificationExpirationMinutes", 30L);
        ReflectionTestUtils.setField(authService, "passwordResetExpirationMinutes", 30L);
    }

    @Test
    void registerCreatesUnverifiedUserAndVerificationToken() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Sarthak Sharma")
                .email("USER@example.com")
                .password("Password123")
                .confirmPassword("Password123")
                .build();
        User savedUser = User.builder().id(1L).name("Sarthak Sharma").email("user@example.com")
                .password("encoded-password").role(Role.USER).emailVerified(false).build();

        when(emailAddressValidationService.normalizeAndValidateForRegistration(request.getEmail()))
                .thenReturn("user@example.com");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(secureTokenService.generateToken()).thenReturn("raw-token");
        when(secureTokenService.hash("raw-token")).thenReturn("token-hash");

        RegistrationResponse response = authService.register(request);

        assertThat(response.isEmailVerificationRequired()).isTrue();
        assertThat(response.getEmail()).isEqualTo("user@example.com");
        verify(emailVerificationTokenRepository).invalidateActiveTokensForUser(eq(savedUser), any());
        verify(emailVerificationTokenRepository).save(any());
        verify(emailService).sendVerificationEmail(savedUser, "raw-token");
    }

    @Test
    void verifiedUserReceivesJwtAtLogin() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("USER@example.com")
                .password("Password123")
                .build();
        User user = User.builder().id(1L).name("Sarthak Sharma").email("user@example.com")
                .password("encoded-password").role(Role.USER).emailVerified(true).build();

        when(emailAddressValidationService.normalize(request.getEmail())).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthenticationResponse response = authService.login(request, "127.0.0.1");

        assertThat(response.getToken()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(authRateLimiter).resetLoginFailures("user@example.com:127.0.0.1");
    }

    @Test
    void unverifiedUserDoesNotReceiveJwtAtLogin() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("user@example.com")
                .password("Password123")
                .build();
        User user = User.builder().id(1L).name("Sarthak Sharma").email("user@example.com")
                .password("encoded-password").role(Role.USER).emailVerified(false).build();

        when(emailAddressValidationService.normalize(request.getEmail())).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(EmailNotVerifiedException.class)
                .hasMessage("Please verify your email before logging in.");
        verify(jwtService, never()).generateToken(any(User.class));
    }



    @Test
    void invalidLoginRecordsRateLimitedFailure() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("user@example.com")
                .password("WrongPassword123")
                .build();
        when(emailAddressValidationService.normalize(request.getEmail())).thenReturn("user@example.com");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request, "127.0.0.1"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");
        verify(authRateLimiter).recordLoginFailure("user@example.com:127.0.0.1");
    }
}
