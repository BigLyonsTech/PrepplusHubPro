package com.prepplushub.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static String id(Authentication authentication) {
        Object details = authentication == null ? null : authentication.getDetails();
        if (!(details instanceof String userId) || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing user context");
        }
        return userId;
    }
}
