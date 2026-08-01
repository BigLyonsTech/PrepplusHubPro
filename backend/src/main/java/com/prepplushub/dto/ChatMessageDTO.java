package com.prepplushub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    @NotBlank(message = "Role is required")
    private String role; // "user" or "assistant"

    @NotBlank(message = "Content is required")
    private String content;
}
