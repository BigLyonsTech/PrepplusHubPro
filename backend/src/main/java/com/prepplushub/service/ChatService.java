package com.prepplushub.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.core.http.StreamResponse;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;
import com.anthropic.models.messages.RawMessageStreamEvent;
import com.prepplushub.dto.ChatMessageDTO;
import com.prepplushub.dto.ChatRequest;
import com.prepplushub.model.Product;
import com.prepplushub.repository.ProductRepository;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;

@Service
public class ChatService {

    private final AnthropicClient anthropicClient;
    private final ProductRepository productRepository;

    public ChatService(AnthropicClient anthropicClient, ProductRepository productRepository) {
        this.anthropicClient = anthropicClient;
        this.productRepository = productRepository;
    }

    @Async
    public void streamChat(ChatRequest request, ResponseBodyEmitter emitter) {
        MessageCreateParams.Builder builder = MessageCreateParams.builder()
                .model(Model.CLAUDE_OPUS_5)
                .maxTokens(1024L)
                .system(buildSystemPrompt());

        for (ChatMessageDTO message : request.getMessages()) {
            if ("assistant".equalsIgnoreCase(message.getRole())) {
                builder.addAssistantMessage(message.getContent());
            } else {
                builder.addUserMessage(message.getContent());
            }
        }

        try (StreamResponse<RawMessageStreamEvent> streamResponse =
                     anthropicClient.messages().createStreaming(builder.build())) {
            streamResponse.stream()
                    .flatMap(event -> event.contentBlockDelta().stream())
                    .flatMap(deltaEvent -> deltaEvent.delta().text().stream())
                    .forEach(textDelta -> {
                        try {
                            emitter.send(textDelta.text(), MediaType.TEXT_PLAIN);
                        } catch (IOException e) {
                            throw new UncheckedIOException(e);
                        }
                    });
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    private String buildSystemPrompt() {
        List<Product> products = productRepository.findByActiveTrueOrderByCreatedAtDesc();

        StringBuilder catalog = new StringBuilder();
        for (Product product : products) {
            catalog.append("- ").append(product.getName())
                    .append(" (").append(product.getCategory()).append("), ")
                    .append("price NGN ").append((long) product.getPrice())
                    .append(", vendor ").append(product.getVendor())
                    .append(", product id ").append(product.getId())
                    .append("\n");
        }

        return """
                You are the PrepplusHub shopping assistant, embedded in a marketplace app that connects \
                independent makers and small vendors with shoppers.

                Help shoppers find products, compare options, and decide what to buy. Only recommend or \
                reference products from the catalog below. Never invent products, prices, or vendors that \
                aren't listed. Prices are in Nigerian Naira; format them as ₦ followed by the number \
                with thousands separators.

                Keep answers concise and conversational. If nothing in the catalog matches what the shopper \
                is looking for, say so honestly rather than guessing.

                Current product catalog:
                """ + catalog;
    }
}
