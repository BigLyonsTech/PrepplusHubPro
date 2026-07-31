package com.oscillate.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private String id;

    private String userId;

    private List<OrderItem> items;

    private DeliveryAddress deliveryAddress;

    private double subtotal;
    private double discount;
    private double shipping;
    private double total;

    @Indexed(unique = true)
    private String paymentReference;

    private String paymentStatus; // PENDING, PAID, FAILED

    private String status; // PENDING_PAYMENT, PROCESSING, IN_TRANSIT, DELIVERED, CANCELLED

    private LocalDateTime placedAt;
    private LocalDateTime paidAt;
}
