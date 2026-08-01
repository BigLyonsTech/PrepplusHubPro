package com.prepplushub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @Valid
    @NotEmpty(message = "At least one message is required")
    private List<ChatMessageDTO> messages;
}
