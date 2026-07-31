package com.oscillate.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oscillate.model.Order;
import com.oscillate.security.CurrentUser;
import com.oscillate.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;
    private final String paystackSecretKey;

    public PaymentController(PaymentService paymentService,
                              ObjectMapper objectMapper,
                              @Value("${paystack.secret-key}") String paystackSecretKey) {
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
        this.paystackSecretKey = paystackSecretKey;
    }

    @PostMapping("/verify/{reference}")
    public ResponseEntity<Order> verify(Authentication authentication, @PathVariable String reference) {
        return ResponseEntity.ok(paymentService.verifyWithPaystack(CurrentUser.id(authentication), reference));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String rawBody,
                                         @RequestHeader(value = "x-paystack-signature", required = false) String signature) {
        if (signature == null || !isValidSignature(rawBody, signature)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            JsonNode event = objectMapper.readTree(rawBody);
            if ("charge.success".equals(event.path("event").asText())) {
                JsonNode data = event.path("data");
                paymentService.confirmPayment(
                        data.path("reference").asText(),
                        data.path("status").asText(),
                        data.path("amount").asLong());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    private boolean isValidSignature(String rawBody, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(paystackSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return MessageDigest.isEqual(
                    computed.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }
}
