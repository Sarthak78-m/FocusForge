package com.aistudycoach.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.aistudycoach.user.Role;
import com.aistudycoach.user.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(
                jwtService,
                "secret",
                "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
        );
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", "86400000");
    }

    @Test
    void generateTokenAndExtractUsername() {
        User user = User.builder()
                .email("user@gmail.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("user@gmail.com");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void invalidTokenThrowsJwtException() {
        User user = User.builder()
                .email("user@gmail.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();

        assertThatThrownBy(() -> jwtService.isTokenValid("invalid-token", user))
                .isInstanceOf(JwtException.class);
    }
}
