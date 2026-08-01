package com.prepplushub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "vendor_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorReview {
    @Id
    private String id;

    private String vendorId;
    private String customerId;
    private String orderId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
