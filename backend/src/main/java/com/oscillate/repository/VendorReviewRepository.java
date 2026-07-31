package com.oscillate.repository;

import com.oscillate.model.VendorReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorReviewRepository extends MongoRepository<VendorReview, String> {
    List<VendorReview> findByVendorIdOrderByCreatedAtDesc(String vendorId);
}
