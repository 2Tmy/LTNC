package com.company.complaints.service;

import com.company.complaints.dto.request.LoginRequest;
import com.company.complaints.dto.request.RegisterRequest;
import com.company.complaints.dto.response.AuthResponse;
import com.company.complaints.entity.User;
import com.company.complaints.enums.Role;
import com.company.complaints.exception.CustomExceptions.EmailAlreadyExistsException;
import com.company.complaints.exception.CustomExceptions.InvalidCredentialsException;
import com.company.complaints.exception.CustomExceptions.UserNotFoundException;
import com.company.complaints.repository.UserRepository;
import com.company.complaints.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Authenticates a user.
     * Deliberately uses the same error message for unknown email and wrong
     * password — this prevents user enumeration attacks.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user, user.getId(), user.getRole().name());
        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(user, token);
    }

    /**
     * Registers a new customer account.
     * Admin accounts must be created explicitly
     * via a future admin endpoint — they cannot self-register.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "An account already exists with email: " + request.getEmail());
        }

        User user = Objects.requireNonNull(User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(trimToNull(request.getPhone()))
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .enabled(true)
                .build(), "User builder returned null");

        User saved = Objects.requireNonNull(
                userRepository.save(Objects.requireNonNull(user, "User is required")),
                "User repository returned null");
        String token = jwtTokenProvider.generateToken(saved, saved.getId(), saved.getRole().name());
        log.info("New user registered: {} (role={})", saved.getEmail(), saved.getRole());

        return buildAuthResponse(saved, token);
    }

    /**
     * Loads the currently authenticated user by email (extracted from SecurityContext).
     */
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + email));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userId(user.getId())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
