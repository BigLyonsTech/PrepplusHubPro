package com.oscillate.repository;

import com.oscillate.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByActiveTrueOrderByCreatedAtDesc();

    List<Product> findByCategoryAndActiveTrue(String category);

    List<Product> findByFeaturedTrueAndActiveTrue();
}
