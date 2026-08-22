package com.mindsprint.config;

import com.mindsprint.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final Environment environment;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${auth.email.verification-required:true}")
    private boolean emailVerificationRequired;

    @Value("${spring.mail.host:}")
    private String emailHost;

    @Value("${app.email.from:}")
    private String emailFrom;

    @PostConstruct
    public void validateProductionConfiguration() {
        if (isProductionProfile()) {
            // Validate JWT Secret
            if (!org.springframework.util.StringUtils.hasText(jwtSecret) || jwtSecret.length() < 32) {
                throw new IllegalStateException(
                    "PRODUCTION CONFIGURATION ERROR: JWT_SECRET must be set and be at least 32 characters. " +
                    "Application cannot start in production without a secure JWT secret."
                );
            }

            // Validate Email Verification
            if (!emailVerificationRequired) {
                throw new IllegalStateException(
                    "PRODUCTION CONFIGURATION ERROR: EMAIL_VERIFICATION_REQUIRED must be true in production. " +
                    "Email verification is mandatory for production security."
                );
            }

            // Validate Email Configuration
            if (!org.springframework.util.StringUtils.hasText(emailHost) || 
                !org.springframework.util.StringUtils.hasText(emailFrom)) {
                throw new IllegalStateException(
                    "PRODUCTION CONFIGURATION ERROR: Email configuration (EMAIL_HOST and EMAIL_FROM) must be set in production. " +
                    "Application cannot start without email delivery configuration when verification is required."
                );
            }
        }
    }

    private boolean isProductionProfile() {
        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles.length == 0) {
            // No explicit profile set - treat as production for safety
            return true;
        }
        return Arrays.stream(activeProfiles)
            .map(String::toLowerCase)
            .noneMatch(profile -> profile.equals("local") || profile.equals("dev") || profile.equals("test"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
