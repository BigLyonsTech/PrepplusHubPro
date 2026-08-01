package com.prepplushub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PaystackConfig {

    @Bean
    public RestClient paystackRestClient(@Value("${paystack.secret-key}") String secretKey) {
        return RestClient.builder()
                .baseUrl("https://api.paystack.co")
                .defaultHeader("Authorization", "Bearer " + secretKey)
                .build();
    }
}
