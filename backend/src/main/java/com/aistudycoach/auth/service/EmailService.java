package com.aistudycoach.auth.service;

import com.aistudycoach.exception.EmailDeliveryException;
import com.aistudycoach.user.User;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Environment environment;

    @Value("${app.frontend-url:${FRONTEND_URL:http://localhost:5173}}")
    private String frontendUrl;

    @Value("${app.email.from:${EMAIL_FROM:}}")
    private String emailFrom;

    public void sendVerificationEmail(User user, String rawToken) {
        String verificationUrl = buildUrl("/verify-email?token=" + rawToken);
        String text = "Verify your MindSprint email address by opening this link:\n\n"
                + verificationUrl
                + "\n\nThis link expires soon. If you did not create an account, you can ignore this email.";
        send(user.getEmail(), "Verify your MindSprint email", text, verificationUrl);
    }

    public void sendPasswordResetEmail(User user, String rawToken) {
        String resetUrl = buildUrl("/reset-password?token=" + rawToken);
        String text = "Reset your MindSprint password by opening this link:\n\n"
                + resetUrl
                + "\n\nThis link expires soon. If you did not request a reset, you can ignore this email.";
        send(user.getEmail(), "Reset your MindSprint password", text, resetUrl);
    }

    private void send(String recipient, String subject, String text, String developmentUrl) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || !StringUtils.hasText(emailFrom)) {
            if (isDevelopmentProfile()) {
                log.info("Development email link for {}: {}", recipient, developmentUrl);
                return;
            }
            throw new EmailDeliveryException("Email delivery is not configured");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailFrom);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (MailException ex) {
            throw new EmailDeliveryException("Unable to send email", ex);
        }
    }

    private String buildUrl(String pathAndQuery) {
        return frontendUrl.replaceAll("/+$", "") + pathAndQuery;
    }

    private boolean isDevelopmentProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .map(String::toLowerCase)
                .anyMatch(profile -> profile.equals("local") || profile.equals("dev") || profile.equals("test"));
    }
}
