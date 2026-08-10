package com.aistudycoach.auth.service;

import com.aistudycoach.user.User;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
public class SmsService {

    @Value("${app.sms.twilio.account-sid:${TWILIO_ACCOUNT_SID:}}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:${TWILIO_AUTH_TOKEN:}}")
    private String authToken;

    @Value("${app.sms.twilio.from-number:${TWILIO_PHONE_NUMBER:}}")
    private String fromNumber;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public void sendTaskDeadlineSms(User user, String taskTitle, String dueDate) {
        if (user == null || !StringUtils.hasText(user.getPhoneNumber()) || !user.isPhoneNotificationsEnabled()) {
            return;
        }

        String recipientPhone = user.getPhoneNumber();
        String messageBody = String.format("MindSprint Alert ⏰: Hi %s, your task '%s' is due in 1 hour (%s). Complete it now in your workspace!",
                user.getName(), taskTitle, dueDate);

        if (isTwilioConfigured()) {
            sendTwilioSms(recipientPhone, messageBody);
        } else {
            log.info("SMS Service [Gateway Simulation] Sent to {}: {}", recipientPhone, messageBody);
        }
    }

    private boolean isTwilioConfigured() {
        return StringUtils.hasText(accountSid) && StringUtils.hasText(authToken) && StringUtils.hasText(fromNumber);
    }

    private void sendTwilioSms(String toPhone, String message) {
        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);
            String formData = "To=" + java.net.URLEncoder.encode(toPhone, StandardCharsets.UTF_8)
                    + "&From=" + java.net.URLEncoder.encode(fromNumber, StandardCharsets.UTF_8)
                    + "&Body=" + java.net.URLEncoder.encode(message, StandardCharsets.UTF_8);

            String authHeader = "Basic " + Base64.getEncoder()
                    .encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(twilioUrl))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formData))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully delivered SMS notification to {}", toPhone);
            } else {
                log.error("Twilio SMS delivery failed with status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send Twilio SMS to {}: {}", toPhone, e.getMessage());
        }
    }
}
