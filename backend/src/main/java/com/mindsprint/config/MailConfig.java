package com.mindsprint.config;

import java.util.Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
public class MailConfig {

    @Value("${spring.mail.host:${EMAIL_HOST:}}")
    private String host;

    @Value("${spring.mail.port:${EMAIL_PORT:587}}")
    private int port;

    @Value("${spring.mail.username:${EMAIL_USERNAME:}}")
    private String username;

    @Value("${spring.mail.password:${EMAIL_PASSWORD:}}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        String targetHost = StringUtils.hasText(host) ? host : "smtp.gmail.com";
        mailSender.setHost(targetHost);
        mailSender.setPort(port > 0 ? port : 587);

        if (StringUtils.hasText(username)) {
            mailSender.setUsername(username.trim());
        }
        if (StringUtils.hasText(password)) {
            mailSender.setPassword(password.trim());
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "*");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        log.info("Initialized JavaMailSender with host: {}, port: {}, username: {}",
                targetHost, mailSender.getPort(), StringUtils.hasText(username) ? username : "(unconfigured)");

        return mailSender;
    }
}
