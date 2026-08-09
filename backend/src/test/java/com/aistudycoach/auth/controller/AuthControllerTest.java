package com.aistudycoach.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.aistudycoach.auth.service.EmailService;
import com.aistudycoach.auth.service.SecureTokenService;
import com.aistudycoach.auth.token.EmailVerificationToken;
import com.aistudycoach.auth.token.PasswordResetToken;
import com.aistudycoach.repository.EmailVerificationTokenRepository;
import com.aistudycoach.repository.PasswordResetTokenRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.user.Role;
import com.aistudycoach.user.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SecureTokenService secureTokenService;

    @MockBean
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        passwordResetTokenRepository.deleteAll();
        emailVerificationTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void validEmailRegistrationCreatesAnUnverifiedAccountAndSendsVerification() throws Exception {
        String rawToken = registerAndCaptureVerificationToken("new.user@example.com");

        User user = userRepository.findByEmail("new.user@example.com").orElseThrow();
        assertThat(user.isEmailVerified()).isFalse();
        assertThat(user.getPassword()).isNotEqualTo("Password123");
        assertThat(emailVerificationTokenRepository.findAll())
                .singleElement()
                .extracting(EmailVerificationToken::getTokenHash)
                .isNotEqualTo(rawToken);
    }

    @Test
    void invalidEmailFormatIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Invalid Email",
                                  "email": "not-an-email",
                                  "password": "Password123",
                                  "confirmPassword": "Password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void disposableEmailDomainIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Disposable Email",
                                  "email": "student@mailinator.com",
                                  "password": "Password123",
                                  "confirmPassword": "Password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Disposable email addresses are not allowed"));
    }

    @Test
    void successfulVerificationMarksEmailAsVerified() throws Exception {
        String rawToken = registerAndCaptureVerificationToken("verify.success@example.com");

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"%s\"}".formatted(rawToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(userRepository.findByEmail("verify.success@example.com").orElseThrow().isEmailVerified()).isTrue();
        assertThat(emailVerificationTokenRepository.findAll()).singleElement()
                .extracting(EmailVerificationToken::getUsedAt)
                .isNotNull();
    }

    @Test
    void expiredVerificationTokenIsRejected() throws Exception {
        User user = createUser("expired.verification@example.com", "Password123", false);
        String rawToken = secureTokenService.generateToken();
        emailVerificationTokenRepository.save(EmailVerificationToken.builder()
                .user(user)
                .tokenHash(secureTokenService.hash(rawToken))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .build());

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"%s\"}".formatted(rawToken)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Verification link is invalid, expired, or already used"));
    }

    @Test
    void alreadyUsedVerificationTokenIsRejected() throws Exception {
        User user = createUser("used.verification@example.com", "Password123", false);
        String rawToken = secureTokenService.generateToken();
        emailVerificationTokenRepository.save(EmailVerificationToken.builder()
                .user(user)
                .tokenHash(secureTokenService.hash(rawToken))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .usedAt(LocalDateTime.now())
                .build());

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"%s\"}".formatted(rawToken)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Verification link is invalid, expired, or already used"));
    }

    @Test
    void unverifiedUserCannotLogIn() throws Exception {
        createUser("unverified.login@example.com", "Password123", false);

        mockMvc.perform(loginRequest("unverified.login@example.com", "Password123"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Please verify your email before logging in."));
    }

    @Test
    void verifiedUserCanLogIn() throws Exception {
        createUser("verified.login@example.com", "Password123", true);

        mockMvc.perform(loginRequest("verified.login@example.com", "Password123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", not(blankOrNullString())));
    }

    @Test
    void resendVerificationInvalidatesThePreviousToken() throws Exception {
        registerAndCaptureVerificationToken("resend@example.com");

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"resend@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(emailService, times(2)).sendVerificationEmail(any(User.class), any(String.class));
        assertThat(emailVerificationTokenRepository.findAll())
                .hasSize(2)
                .filteredOn(token -> token.getUsedAt() == null)
                .hasSize(1);
    }

    @Test
    void passwordResetChangesPasswordAndConsumesToken() throws Exception {
        User user = createUser("reset@example.com", "Password123", true);

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"reset@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetEmail(any(User.class), tokenCaptor.capture());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "token": "%s",
                                  "password": "NewPassword123",
                                  "confirmPassword": "NewPassword123"
                                }
                                """.formatted(tokenCaptor.getValue())))
                .andExpect(status().isOk());

        assertThat(passwordEncoder.matches("NewPassword123", userRepository.findById(user.getId()).orElseThrow().getPassword()))
                .isTrue();
        assertThat(passwordResetTokenRepository.findAll()).singleElement()
                .extracting(PasswordResetToken::getUsedAt)
                .isNotNull();
    }

    @Test
    void invalidPasswordIsRejected() throws Exception {
        createUser("invalid.password@example.com", "Password123", true);

        mockMvc.perform(loginRequest("invalid.password@example.com", "WrongPassword123"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void duplicateRegistrationIsRejected() throws Exception {
        createUser("duplicate@example.com", "Password123", false);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Duplicate User",
                                  "email": "duplicate@example.com",
                                  "password": "Password123",
                                  "confirmPassword": "Password123"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already exists"));
    }

    @Test
    void resendVerificationIsRateLimited() throws Exception {
        registerAndCaptureVerificationToken("rate.limit@example.com");
        String request = "{\"email\":\"rate.limit@example.com\"}";

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    void protectedEndpointRequiresJwtAndAcceptsVerifiedUserJwt() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        createUser("current.user@example.com", "Password123", true);
        MvcResult result = mockMvc.perform(loginRequest("current.user@example.com", "Password123"))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = payload.path("data").path("token").asText();

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.emailVerified").value(true));
    }

    private String registerAndCaptureVerificationToken(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Sarthak Sharma",
                                  "email": "%s",
                                  "password": "Password123",
                                  "confirmPassword": "Password123"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.token").doesNotExist())
                .andExpect(jsonPath("$.data.emailVerificationRequired").value(true));

        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendVerificationEmail(any(User.class), tokenCaptor.capture());
        return tokenCaptor.getValue();
    }

    private User createUser(String email, String rawPassword, boolean emailVerified) {
        return userRepository.save(User.builder()
                .name("Sarthak Sharma")
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.USER)
                .emailVerified(emailVerified)
                .build());
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder loginRequest(
            String email,
            String password
    ) {
        return post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password));
    }
}
