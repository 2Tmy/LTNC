package com.company.complaints.auth;

import com.company.complaints.dto.request.LoginRequest;
import com.company.complaints.dto.request.RegisterRequest;
import com.company.complaints.dto.response.AuthResponse;
import com.company.complaints.entity.User;
import com.company.complaints.enums.Role;
import com.company.complaints.exception.CustomExceptions.EmailAlreadyExistsException;
import com.company.complaints.exception.CustomExceptions.InvalidCredentialsException;
import com.company.complaints.repository.UserRepository;
import com.company.complaints.security.JwtTokenProvider;
import com.company.complaints.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository   userRepository;
    @Mock private PasswordEncoder  passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login — valid credentials return a token and correct role")
    void testLoginSuccess() {
        User user = User.builder()
                .id(1L)
                .name("Alex Johnson")
                .email("alex@test.com")
                .password("hashed_pw")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        when(userRepository.findByEmail("alex@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "hashed_pw")).thenReturn(true);
        when(jwtTokenProvider.generateToken(user, 1L, "CUSTOMER")).thenReturn("jwt.token.here");

        AuthResponse result = authService.login(new LoginRequest("alex@test.com", "secret123"));

        assertThat(result.getToken()).isEqualTo("jwt.token.here");
        // Frontend expects lowercase "customer" (mapped from CUSTOMER)
        assertThat(result.getRole()).isEqualTo("customer");
        assertThat(result.getEmail()).isEqualTo("alex@test.com");
        assertThat(result.getUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("login — wrong password throws InvalidCredentialsException")
    void testLoginWithWrongPassword() {
        User user = User.builder()
                .id(1L)
                .name("Alex Johnson")
                .email("alex@test.com")
                .password("hashed_pw")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        when(userRepository.findByEmail("alex@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashed_pw")).thenReturn(false);

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("alex@test.com", "wrongpassword")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("login — unknown email throws InvalidCredentialsException (same message, prevents enumeration)")
    void testLoginWithUnknownEmail() {
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                authService.login(new LoginRequest("nobody@test.com", "anything")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("register — new email creates account and returns token")
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("bcrypt_hash");

        User savedUser = User.builder()
                .id(2L)
                .name("New User")
                .email("new@test.com")
                .password("bcrypt_hash")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken(savedUser, 2L, "CUSTOMER")).thenReturn("new.jwt.token");

        AuthResponse result = authService.register(
                new RegisterRequest("New User", "new@test.com", "password1", null));

        assertThat(result.getToken()).isEqualTo("new.jwt.token");
        assertThat(result.getRole()).isEqualTo("customer");
        assertThat(result.getUserId()).isEqualTo(2L);
        // Password must be encoded before saving — never stored as plaintext
        verify(passwordEncoder).encode("password1");
    }

    @Test
    @DisplayName("register — duplicate email throws EmailAlreadyExistsException")
    void testRegisterWithDuplicateEmail() {
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(
                        new RegisterRequest("User", "existing@test.com", "password1", null)))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("existing@test.com");
    }

    @Test
    @DisplayName("register — null role defaults to CUSTOMER")
    void testRegisterDefaultsToCustomer() {
        when(userRepository.existsByEmail("anon@test.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hash");

        User savedUser = User.builder()
                .id(3L).name("Anon").email("anon@test.com")
                .password("hash").role(Role.CUSTOMER).enabled(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken(savedUser, 3L, "CUSTOMER")).thenReturn("tok");

        // role field deliberately omitted (null)
        AuthResponse result = authService.register(
                new RegisterRequest("Anon", "anon@test.com", "pass1234", null));

        assertThat(result.getRole()).isEqualTo("customer");
    }
}
