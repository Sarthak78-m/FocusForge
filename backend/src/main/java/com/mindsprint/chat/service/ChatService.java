package com.mindsprint.chat.service;

import com.mindsprint.chat.dto.ChatMessageDto;
import com.mindsprint.chat.dto.ChatMessageResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final PromptBuilder promptBuilder;
    private final AIService aiService;

    public ChatMessageResponseDto processMessage(ChatMessageDto request) {
        log.info("Processing chat message for conversation: {}", request.getConversationId());

        // 1. Build prompt context using PromptBuilder
        String prompt = promptBuilder.buildPrompt(request.getMessage(), request.getContext());

        // 2. Invoke AIService to query the selected LLM
        String reply = aiService.generateResponse(prompt);

        // 3. Construct default suggestions
        List<String> suggestedReplies = List.of(
                "📅 What are my deadlines?",
                "🏆 Tell me my work streak",
                "💡 Give me a work tip"
        );

        return ChatMessageResponseDto.builder()
                .reply(reply)
                .conversationId(request.getConversationId())
                .suggestedReplies(suggestedReplies)
                .build();
    }
}
