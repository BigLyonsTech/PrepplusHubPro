package com.prepplushub.controller;

import com.prepplushub.dto.CreateOrderRequest;
import com.prepplushub.model.Order;
import com.prepplushub.security.CurrentUser;
import com.prepplushub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(Authentication authentication, @Valid @RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrderFromCart(CurrentUser.id(authentication), request.getDeliveryAddress());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrders(CurrentUser.id(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrder(CurrentUser.id(authentication), id));
    }
}
