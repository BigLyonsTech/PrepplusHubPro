package com.oscillate.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;

    private String name;
    private String vendor;
    private String vendorId;
    private double price;
    private Double originalPrice;
    private String category;
    private double rating;
    private int reviewCount;
    private String description;
    private String image;
    private boolean featured;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
