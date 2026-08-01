package com.prepplushub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;

    private String message;

    private UserDTO user;

    private String token;

    // Populated only when app.dev-mode=true — lets local testing skip real email delivery.
    private String devOtp;

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
