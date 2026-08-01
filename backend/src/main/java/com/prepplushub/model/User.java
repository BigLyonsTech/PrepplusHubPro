package com.prepplushub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String role; // CUSTOMER, VENDOR, ADMIN

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private String otp;

    private LocalDateTime otpExpiry;

    private boolean emailVerified;

    private boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String profileImage;

    private String bio;

    private String vendorStoreDescription;

    public User(String email) {
        this.email = email;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }
}
