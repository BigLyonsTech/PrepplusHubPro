package com.prepplushub.controller;

import com.prepplushub.dto.CreateProductReviewRequest;
import com.prepplushub.dto.CreateVendorReviewRequest;
import com.prepplushub.model.ProductReview;
import com.prepplushub.model.VendorReview;
import com.prepplushub.security.CurrentUser;
import com.prepplushub.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<List<ProductReview>> getProductReviews(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductReview> addProductReview(Authentication authentication,
                                                            @Valid @RequestBody CreateProductReviewRequest request) {
        ProductReview review = reviewService.addProductReview(CurrentUser.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/vendors/{vendorId}")
    public ResponseEntity<List<VendorReview>> getVendorReviews(@PathVariable String vendorId) {
        return ResponseEntity.ok(reviewService.getVendorReviews(vendorId));
    }

    @PostMapping("/vendors")
    public ResponseEntity<VendorReview> addVendorReview(Authentication authentication,
                                                          @Valid @RequestBody CreateVendorReviewRequest request) {
        VendorReview review = reviewService.addVendorReview(CurrentUser.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
}
