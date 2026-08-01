package com.prepplushub.service;

import com.prepplushub.model.Product;
import com.prepplushub.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProducts() {
        return productRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id).orElse(null);
    }
}
