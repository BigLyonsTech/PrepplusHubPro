package com.oscillate.service;

import com.oscillate.dto.PaystackVerifyResponse;
import com.oscillate.model.Order;
import com.oscillate.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final RestClient paystackRestClient;
    private final OrderRepository orderRepository;

    public PaymentService(RestClient paystackRestClient, OrderRepository orderRepository) {
        this.paystackRestClient = paystackRestClient;
        this.orderRepository = orderRepository;
    }

    public Order verifyWithPaystack(String userId, String reference) {
        Order order = orderRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        if ("PAID".equals(order.getPaymentStatus())) {
            return order;
        }

        PaystackVerifyResponse response;
        try {
            response = paystackRestClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .body(PaystackVerifyResponse.class);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not verify payment with Paystack");
        }

        if (response == null || response.getData() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not verify payment with Paystack");
        }

        return confirmPayment(reference, response.getData().getStatus(), response.getData().getAmount());
    }

    public Order confirmPayment(String reference, String paystackStatus, long amountKobo) {
        Order order = orderRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if ("PAID".equals(order.getPaymentStatus())) {
            return order;
        }

        long expectedKobo = Math.round(order.getTotal() * 100);
        boolean success = "success".equals(paystackStatus) && amountKobo == expectedKobo;

        if (success) {
            order.setPaymentStatus("PAID");
            order.setStatus("PROCESSING");
            order.setPaidAt(LocalDateTime.now());
        } else {
            order.setPaymentStatus("FAILED");
        }

        return orderRepository.save(order);
    }
}
