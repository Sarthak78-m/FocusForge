package com.mindsprint.chat.controller;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.chat.dto.ChatMessageDto;
import com.mindsprint.chat.dto.ChatMessageResponseDto;
import com.mindsprint.chat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Tag(name = "Chat", description = "Mind Sprint Chatbot APIs")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Send message to Mind Sprint with application context")
    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatMessageResponseDto>> sendMessage(
            @Valid @RequestBody ChatMessageDto request
    ) {
        try {
            ChatMessageResponseDto response = chatService.processMessage(request);
            return ResponseEntity.ok(ApiResponse.success("Message processed successfully", response));
        } catch (Exception e) {
            log.error("Error processing chat message: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Unable to generate the AI response. Please try again.", null));
        }
    }
}
