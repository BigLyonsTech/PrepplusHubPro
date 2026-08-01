package com.prepplushub.repository;

import com.prepplushub.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserIdOrderByPlacedAtDesc(String userId);

    Optional<Order> findByPaymentReference(String paymentReference);
}
