package com.oscillate.service;

import com.oscillate.dto.CreateProductReviewRequest;
import com.oscillate.dto.CreateVendorReviewRequest;
import com.oscillate.model.Product;
import com.oscillate.model.ProductReview;
import com.oscillate.model.User;
import com.oscillate.model.VendorReview;
import com.oscillate.repository.ProductRepository;
import com.oscillate.repository.ProductReviewRepository;
import com.oscillate.repository.UserRepository;
import com.oscillate.repository.VendorReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final VendorReviewRepository vendorReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ProductReviewRepository productReviewRepository,
                          VendorReviewRepository vendorReviewRepository,
                          ProductRepository productRepository,
                          UserRepository userRepository) {
        this.productReviewRepository = productReviewRepository;
        this.vendorReviewRepository = vendorReviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ProductReview> getProductReviews(String productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<VendorReview> getVendorReviews(String vendorId) {
        return vendorReviewRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public ProductReview addProductReview(String userId, CreateProductReviewRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        ProductReview review = new ProductReview(
                null,
                request.getProductId(),
                userId,
                displayName(userId),
                request.getRating(),
                request.getComment(),
                LocalDateTime.now());
        ProductReview saved = productReviewRepository.save(review);

        recalculateProductRating(product);

        return saved;
    }

    public VendorReview addVendorReview(String userId, CreateVendorReviewRequest request) {
        VendorReview review = new VendorReview(
                null,
                request.getVendorId(),
                userId,
                request.getOrderId(),
                request.getRating(),
                request.getComment(),
                LocalDateTime.now());
        return vendorReviewRepository.save(review);
    }

    private void recalculateProductRating(Product product) {
        List<ProductReview> reviews = productReviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        double average = reviews.stream().mapToInt(ProductReview::getRating).average().orElse(0);
        product.setRating(Math.round(average * 10) / 10.0);
        product.setReviewCount(reviews.size());
        productRepository.save(product);
    }

    private String displayName(String userId) {
        return userRepository.findById(userId)
                .map(this::formatName)
                .orElse("Anonymous");
    }

    private String formatName(User user) {
        if (user.getFirstName() == null) {
            return "Anonymous";
        }
        if (user.getLastName() != null && !user.getLastName().isBlank()) {
            return user.getFirstName() + " " + user.getLastName().charAt(0) + ".";
        }
        return user.getFirstName();
    }
}
