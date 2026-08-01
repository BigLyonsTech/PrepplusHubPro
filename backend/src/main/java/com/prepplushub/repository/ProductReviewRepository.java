package com.prepplushub.repository;

import com.prepplushub.model.ProductReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(String productId);
}
