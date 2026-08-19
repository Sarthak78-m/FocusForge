package com.mindsprint.chat.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String conversationId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    @Valid
    private ChatContextDto context;
}
