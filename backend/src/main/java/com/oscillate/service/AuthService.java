package com.oscillate.service;

import com.oscillate.dto.*;
import com.oscillate.model.User;
import com.oscillate.repository.UserRepository;
import com.oscillate.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Value("${app.dev-mode:false}")
    private boolean devMode;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Random random = new Random();

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);
        user.setEmailVerified(false);

        // Generate and set OTP
        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        // TODO: Send OTP via email
        System.out.println("OTP for " + request.getEmail() + ": " + otp);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Registration successful. OTP sent to email.");
        if (devMode) {
            response.setDevOtp(otp);
        }
        return response;
    }

    public AuthResponse sendOTP(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();
        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // TODO: Send OTP via email
        System.out.println("OTP for " + email + ": " + otp);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("OTP sent to email");
        if (devMode) {
            response.setDevOtp(otp);
        }
        return response;
    }

    public AuthResponse verifyOTP(OTPVerificationRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        // Check if OTP is expired
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return new AuthResponse(false, "OTP expired");
        }

        // Check if OTP matches
        if (!user.getOtp().equals(request.getOtp())) {
            return new AuthResponse(false, "Invalid OTP");
        }

        // Mark email as verified
        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Email verified successfully");
        response.setUser(UserDTO.fromUser(user));
        response.setToken(jwtService.generateToken(user.getEmail(), user.getId(), user.getRole()));
        return response;
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Invalid email or password");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(false, "Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            return new AuthResponse(false, "Please verify your email first");
        }

        if (!user.isActive()) {
            return new AuthResponse(false, "Account is inactive");
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setUser(UserDTO.fromUser(user));
        response.setToken(jwtService.generateToken(user.getEmail(), user.getId(), user.getRole()));
        return response;
    }

    private String generateOTP() {
        return String.format("%06d", random.nextInt(1000000));
    }
}
