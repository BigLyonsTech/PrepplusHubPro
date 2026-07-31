package com.oscillate.controller;

import com.oscillate.dto.ChatRequest;
import com.oscillate.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseBodyEmitter chat(@Valid @RequestBody ChatRequest request) {
        ResponseBodyEmitter emitter = new ResponseBodyEmitter(120_000L);
        chatService.streamChat(request, emitter);
        return emitter;
    }
}
