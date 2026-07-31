package com.oscillate.controller;

import com.oscillate.dto.AddCartItemRequest;
import com.oscillate.dto.CartResponse;
import com.oscillate.dto.UpdateCartItemRequest;
import com.oscillate.security.CurrentUser;
import com.oscillate.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.toCartResponse(CurrentUser.id(authentication)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(Authentication authentication,
                                                 @Valid @RequestBody AddCartItemRequest request) {
        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        return ResponseEntity.ok(cartService.addItem(CurrentUser.id(authentication), request.getProductId(), quantity));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItem(Authentication authentication,
                                                     @PathVariable String productId,
                                                     @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(CurrentUser.id(authentication), productId, request.getQuantity()));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(Authentication authentication, @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItem(CurrentUser.id(authentication), productId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.clear(CurrentUser.id(authentication)));
    }
}
