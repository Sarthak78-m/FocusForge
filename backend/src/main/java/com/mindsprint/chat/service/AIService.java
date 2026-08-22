package com.mindsprint.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Value("${OPENAI_API_KEY:}")
    private String openaiApiKey;

    public String generateResponse(String prompt) {
        // Log keys status securely
        log.info("AIService invoking LLM. Gemini Key Present: {}, OpenAI Key Present: {}",
                geminiApiKey != null && !geminiApiKey.isEmpty(),
                openaiApiKey != null && !openaiApiKey.isEmpty());

        // 1. Try Gemini first if key is present
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                return callGemini(prompt);
            } catch (Exception e) {
                log.error("Error calling Gemini API: {}", e.getMessage(), e);
                // Fallback to OpenAI if key is present
                if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
                    log.info("Gemini call failed. Attempting fallback to OpenAI.");
                    try {
                        return callOpenAI(prompt);
                    } catch (Exception ex) {
                        log.error("Fallback OpenAI call also failed: {}", ex.getMessage(), ex);
                        throw new RuntimeException("AI service temporarily unavailable");
                    }
                }
                throw new RuntimeException("AI service temporarily unavailable");
            }
        }

        // 2. Try OpenAI next if key is present
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            try {
                return callOpenAI(prompt);
            } catch (Exception e) {
                log.error("Error calling OpenAI API: {}", e.getMessage(), e);
                throw new RuntimeException("AI service temporarily unavailable");
            }
        }

        // 3. Fallback if no keys are provided
        log.warn("No AI API keys configured (GEMINI_API_KEY or OPENAI_API_KEY are missing).");
        return "⚠️ **AI integration is currently running in local offline mode.**\n\nTo enable full AI support, configure your API keys by setting the environment variables `GEMINI_API_KEY` or `OPENAI_API_KEY` in your Spring Boot environment.\n\nHere is what I can tell you from the context:\n\nIf you ask me general questions, I won't be able to answer them until the API key is configured. But you can still use all task, streak, and work commands!";
    }

    private String callGemini(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey.trim());

        // Build Gemini payload structure
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partsObj = new HashMap<>();
        partsObj.put("parts", List.of(textPart));

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(partsObj));

        String jsonPayload = objectMapper.writeValueAsString(payload);
        HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);

        log.debug("Sending request to Gemini API");
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        }
        throw new RuntimeException("Unexpected response format from Gemini: " + response.getBody());
    }

    private String callOpenAI(String prompt) throws Exception {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey.trim());

        // Build OpenAI payload
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "gpt-4o-mini");
        payload.put("messages", List.of(userMessage));

        String jsonPayload = objectMapper.writeValueAsString(payload);
        HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);

        log.debug("Sending request to OpenAI API");
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("choices")
                    .path(0)
                    .path("message")
                    .path("content");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        }
        throw new RuntimeException("Unexpected response format from OpenAI: " + response.getBody());
    }
}
