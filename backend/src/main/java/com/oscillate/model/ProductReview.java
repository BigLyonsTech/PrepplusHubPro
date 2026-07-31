package com.oscillate.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "product_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReview {
    @Id
    private String id;

    private String productId;
    private String customerId;
    private String author;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
