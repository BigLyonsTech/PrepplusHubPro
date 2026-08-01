package com.prepplushub.service;

import com.prepplushub.model.Cart;
import com.prepplushub.model.CartItem;
import com.prepplushub.model.DeliveryAddress;
import com.prepplushub.model.Order;
import com.prepplushub.model.OrderItem;
import com.prepplushub.model.Product;
import com.prepplushub.repository.OrderRepository;
import com.prepplushub.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    public Order createOrderFromCart(String userId, DeliveryAddress deliveryAddress) {
        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        List<String> productIds = cart.getItems().stream().map(CartItem::getProductId).toList();
        Map<String, Product> productsById = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        List<OrderItem> orderItems = cart.getItems().stream()
                .filter(item -> productsById.containsKey(item.getProductId()))
                .map(item -> {
                    Product product = productsById.get(item.getProductId());
                    return new OrderItem(product.getId(), product.getName(), product.getImage(),
                            product.getPrice(), item.getQuantity());
                })
                .toList();

        if (orderItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart items are no longer available");
        }

        double subtotal = orderItems.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
        double discount = cart.getItems().stream()
                .filter(item -> productsById.containsKey(item.getProductId()))
                .mapToDouble(item -> {
                    Product product = productsById.get(item.getProductId());
                    double original = product.getOriginalPrice() != null ? product.getOriginalPrice() : product.getPrice();
                    return (original - product.getPrice()) * item.getQuantity();
                })
                .sum();
        double shipping = PricingUtil.shippingFor(subtotal);
        double total = subtotal + shipping;

        String id = new ObjectId().toHexString();
        Order order = new Order();
        order.setId(id);
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setDeliveryAddress(deliveryAddress);
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShipping(shipping);
        order.setTotal(total);
        order.setPaymentReference("osc_" + id);
        order.setPaymentStatus("PENDING");
        order.setStatus("PENDING_PAYMENT");
        order.setPlacedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);
        cartService.clear(userId);
        return saved;
    }

    public List<Order> getOrders(String userId) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId);
    }

    public Order getOrder(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }
}
