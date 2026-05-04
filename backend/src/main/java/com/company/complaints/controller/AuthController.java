package com.company.complaints.controller;

import com.company.complaints.dto.request.LoginRequest;
import com.company.complaints.dto.request.RegisterRequest;
import com.company.complaints.dto.response.ApiResponse;
import com.company.complaints.dto.response.AuthResponse;
import com.company.complaints.entity.User;
import com.company.complaints.enums.Role;
import com.company.complaints.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Creates a new user account and returns a JWT so the client is
     * immediately authenticated without a second login request.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        log.info("Registration attempt for: {}", request.getEmail());
        AuthResponse data = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", data));
    }

    /**
     * POST /api/auth/login
     * Validates credentials and returns a signed JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        log.info("Login attempt for: {}", request.getEmail());
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    /**
     * GET /api/auth/me
     * Returns profile data for the currently authenticated user.
     * Requires a valid Bearer token; the email is taken from the SecurityContext
     * (set by JwtAuthenticationFilter) — the client never sends the email directly.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = authService.getCurrentUser(email);

        AuthResponse data = AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build(); // no token — client already has it

        return ResponseEntity.ok(ApiResponse.success("User retrieved", data));
    }

    /** GET /api/auth/check-role — any authenticated user sees their full role info */
    @GetMapping("/check-role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkRole() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUser(email);
        Role role = user.getRole();

        Map<String, Object> info = Map.of(
                "userId",        user.getId(),
                "name",          user.getName(),
                "email",         user.getEmail(),
                "role",          role.name(),
                "isCustomer",    role == Role.CUSTOMER,
                "isStaff",       role == Role.CS_STAFF,
                "isSpecialist",  role == Role.SPECIALIST,
                "isManagement",  role == Role.MANAGEMENT
        );
        return ResponseEntity.ok(ApiResponse.success("Role verified", info));
    }

    /** GET /api/auth/customer-only — accessible only to CUSTOMER role */
    @GetMapping("/customer-only")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> customerOnly() {
        return ResponseEntity.ok(ApiResponse.success("Access granted: CUSTOMER", null));
    }

    /** GET /api/auth/staff-only — accessible to CS_STAFF, SPECIALIST, MANAGEMENT */
    @GetMapping("/staff-only")
    @PreAuthorize("hasAnyRole('CS_STAFF','SPECIALIST','MANAGEMENT')")
    public ResponseEntity<ApiResponse<String>> staffOnly() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success("Access granted: " + user.getRole().name(), null));
    }

    /** GET /api/auth/management-only — accessible only to MANAGEMENT role */
    @GetMapping("/management-only")
    @PreAuthorize("hasRole('MANAGEMENT')")
    public ResponseEntity<ApiResponse<Void>> managementOnly() {
        return ResponseEntity.ok(ApiResponse.success("Access granted: MANAGEMENT", null));
    }
}
