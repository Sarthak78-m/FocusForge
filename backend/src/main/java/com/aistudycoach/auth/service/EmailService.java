package com.aistudycoach.auth.service;

import com.aistudycoach.exception.EmailDeliveryException;
import com.aistudycoach.user.User;
import jakarta.mail.internet.MimeMessage;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendVerificationEmail(User user, String rawToken) {
        String verificationUrl = buildUrl("/verify-email?token=" + rawToken);
        String subject = "Verify your MindSprint Account";
        String htmlBody = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">MindSprint</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">AI Study Coach & Productivity Studio</p>
                    </div>
                    <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Welcome, %s! 👋</h3>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                            Thank you for joining MindSprint. Please click the button below to verify your email address and activate your study workspace.
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="%s" style="background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                                Verify Email Address
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
                            If you did not request this, you can safely ignore this email.
                        </p>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 MindSprint AI Study Coach
                    </div>
                </div>
                """.formatted(user.getName(), verificationUrl);

        send(user.getEmail(), subject, htmlBody, verificationUrl);
    }

    public void sendPasswordResetEmail(User user, String rawToken) {
        String resetUrl = buildUrl("/reset-password?token=" + rawToken);
        String subject = "Reset your MindSprint Password";
        String htmlBody = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">MindSprint</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">AI Study Coach & Productivity Studio</p>
                    </div>
                    <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Password Reset Request</h3>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                            We received a request to reset your MindSprint password. Click the button below to choose a new password.
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="%s" style="background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
                            This reset link expires in 30 minutes. If you did not request a password reset, please ignore this email.
                        </p>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 MindSprint AI Study Coach
                    </div>
                </div>
                """.formatted(resetUrl);

        send(user.getEmail(), subject, htmlBody, resetUrl);
    }

    public void sendPasswordChangedNotification(User user) {
        String subject = "Security Alert: MindSprint Password Updated";
        String htmlBody = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">MindSprint</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">AI Study Coach & Productivity Studio</p>
                    </div>
                    <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Password Successfully Changed 🔐</h3>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                            Hi %s, your MindSprint account password was successfully updated.
                        </p>
                        <p style="color: #e11d48; font-size: 13px; font-weight: 600;">
                            If you did not make this change, please reset your password immediately or contact support.
                        </p>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 MindSprint AI Study Coach
                    </div>
                </div>
                """.formatted(user.getName());

        send(user.getEmail(), subject, htmlBody, frontendUrl);
    }

    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to MindSprint! 🚀 Your Study Workspace is Ready";
        String loginUrl = buildUrl("/login");
        String htmlBody = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">MindSprint</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">AI Study Coach & Productivity Studio</p>
                    </div>
                    <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Email Verified Successfully! 🎉</h3>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                            Welcome aboard, %s! Your account is now fully verified. Log in to start focus sprints, manage task studios, and chat with your 24/7 AI Coach.
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="%s" style="background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                                Launch Workspace
                            </a>
                        </div>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 MindSprint AI Study Coach
                    </div>
                </div>
                """.formatted(user.getName(), loginUrl);

        send(user.getEmail(), subject, htmlBody, loginUrl);
    }

    public void sendTaskDeadlineReminderEmail(User user, String taskTitle, String dueDateStr) {
        String subject = "⏰ 1-Hour Deadline Alert: " + taskTitle;
        String taskUrl = buildUrl("/tasks");
        String htmlBody = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">MindSprint</h2>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">AI Study Coach & Productivity Studio</p>
                    </div>
                    <div style="padding: 24px; background-color: #fff1f2; border-radius: 12px; margin-bottom: 24px; border: 1px solid #fecdd3;">
                        <h3 style="color: #e11d48; margin-top: 0; font-size: 18px;">⏰ Task Deadline Reminder (1 Hour Remaining)</h3>
                        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                            Hi %s, your task <strong>"%s"</strong> is due in 1 hour (%s).
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="%s" style="background: linear-gradient(135deg, #e11d48 0%%, #f43f5e 100%%); color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);">
                                Open Task Studio
                            </a>
                        </div>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 MindSprint AI Study Coach
                    </div>
                </div>
                """.formatted(user.getName(), taskTitle, dueDateStr, taskUrl);

        send(user.getEmail(), subject, htmlBody, taskUrl);
    }

    private void send(String recipient, String subject, String htmlBody, String developmentUrl) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        String from = StringUtils.hasText(emailFrom) ? emailFrom : mailUsername;

        if (mailSender == null || !StringUtils.hasText(from)) {
            if (isDevelopmentProfile() || !isEmailConfigured()) {
                log.info("Development email link generated for {}: {}", recipient, developmentUrl);
                return;
            }
            throw new EmailDeliveryException("Email delivery is not configured");
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("Successfully sent email to {} with subject '{}'", recipient, subject);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", recipient, ex.getMessage(), ex);
            if (isDevelopmentProfile()) {
                log.info("Fallback development link for {}: {}", recipient, developmentUrl);
                return;
            }
            throw new EmailDeliveryException("Unable to deliver email. Please verify your SMTP settings or check spam folder.", ex);
        }
    }

    public boolean isEmailConfigured() {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        String from = StringUtils.hasText(emailFrom) ? emailFrom : mailUsername;
        return mailSender != null && StringUtils.hasText(from);
    }

    public boolean isDevelopmentProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .map(String::toLowerCase)
                .anyMatch(profile -> profile.equals("local") || profile.equals("dev") || profile.equals("test"));
    }

    private String buildUrl(String pathAndQuery) {
        return frontendUrl.replaceAll("/+$", "") + pathAndQuery;
    }
}
