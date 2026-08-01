package com.prepplushub.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaystackVerifyResponse {
    private boolean status;
    private String message;
    private PaystackTransactionData data;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PaystackTransactionData {
        private String status;
        private String reference;
        private long amount;
    }
}
