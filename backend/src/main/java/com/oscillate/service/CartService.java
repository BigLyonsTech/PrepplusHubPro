package com.oscillate.service;

import com.oscillate.dto.CartLineDTO;
import com.oscillate.dto.CartResponse;
import com.oscillate.model.Cart;
import com.oscillate.model.CartItem;
import com.oscillate.model.Product;
import com.oscillate.repository.CartRepository;
import com.oscillate.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> cartRepository.save(new Cart(userId)));
    }

    public CartResponse addItem(String userId, String productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem existing = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            cart.getItems().add(new CartItem(productId, quantity));
        }

        return save(cart);
    }

    public CartResponse updateItemQuantity(String userId, String productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        } else {
            cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(item -> item.setQuantity(quantity));
        }
        return save(cart);
    }

    public CartResponse removeItem(String userId, String productId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        return save(cart);
    }

    public CartResponse clear(String userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        return save(cart);
    }

    public CartResponse toCartResponse(String userId) {
        return toCartResponse(getOrCreateCart(userId));
    }

    private CartResponse save(Cart cart) {
        cart.setUpdatedAt(LocalDateTime.now());
        Cart saved = cartRepository.save(cart);
        return toCartResponse(saved);
    }

    private CartResponse toCartResponse(Cart cart) {
        if (cart.getItems().isEmpty()) {
            return new CartResponse(List.of(), 0, 0, 0, 0);
        }

        List<String> productIds = cart.getItems().stream().map(CartItem::getProductId).toList();
        Map<String, Product> productsById = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        List<CartLineDTO> lines = cart.getItems().stream()
                .filter(item -> productsById.containsKey(item.getProductId()))
                .map(item -> {
                    Product product = productsById.get(item.getProductId());
                    return new CartLineDTO(
                            product.getId(),
                            product.getName(),
                            product.getImage(),
                            product.getCategory(),
                            product.getPrice(),
                            product.getOriginalPrice(),
                            item.getQuantity());
                })
                .toList();

        double subtotal = lines.stream().mapToDouble(line -> line.getPrice() * line.getQuantity()).sum();
        double discount = lines.stream()
                .mapToDouble(line -> {
                    double original = line.getOriginalPrice() != null ? line.getOriginalPrice() : line.getPrice();
                    return (original - line.getPrice()) * line.getQuantity();
                })
                .sum();
        double shipping = PricingUtil.shippingFor(subtotal);
        double total = subtotal + shipping;

        return new CartResponse(lines, subtotal, discount, shipping, total);
    }
}
