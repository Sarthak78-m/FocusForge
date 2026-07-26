package com.aistudycoach.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * WebConfig
 *
 * Registers shared infrastructure beans for HTTP communication.
 * RestTemplate is configured with explicit connect/read timeouts to prevent
 * Tomcat thread starvation when calling external AI APIs (Gemini, OpenAI).
 */
@Configuration
public class WebConfig {

    /** 5-second connection timeout — fail fast if the AI endpoint is unreachable. */
    private static final int CONNECT_TIMEOUT_MS = 5_000;

    /**
     * 60-second read timeout — LLM responses can be slow for complex prompts.
     * This is a reasonable upper bound that avoids blocking indefinitely.
     */
    private static final int READ_TIMEOUT_MS = 60_000;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }
}
