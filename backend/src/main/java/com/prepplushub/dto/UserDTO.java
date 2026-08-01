package com.prepplushub.dto;

import com.prepplushub.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;

    private String email;

    private String role;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private boolean emailVerified;

    private String profileImage;

    private String bio;

    public static UserDTO fromUser(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setProfileImage(user.getProfileImage());
        dto.setBio(user.getBio());
        return dto;
    }
}
