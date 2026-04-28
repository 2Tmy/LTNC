package com.company.complaints.config;

import com.company.complaints.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Map;

/**
 * Central Spring Security configuration.
 *
 * Role strategy (aligned with frontend):
 *   - Frontend routePaths.js recognises two string values: "customer" and "admin".
 *   - The JWT *claim* stores the full backend role (CUSTOMER, CS_STAFF, SPECIALIST,
 *     MANAGEMENT) so Spring Security can enforce fine-grained access on future endpoints.
 *   - AuthResponse.role returns the frontend-compatible string ("customer" / "admin")
 *     so the client's ProtectedRoute guard works without any frontend change.
 *
 * CORS origins match the Vite dev server (5173) and the optional CRA dev server (3000).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize / @Secured on individual endpoints
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService      userDetailsService;

    // Paths that must be reachable without a JWT.
    // /api/auth/me is intentionally excluded — it requires a valid token.
    private static final String[] PUBLIC_PATHS = {
            "/api/auth/register",
            "/api/auth/login",
            "/swagger-ui/**",       // Swagger UI static assets
            "/swagger-ui.html",
            "/v3/api-docs/**"       // OpenAPI JSON spec
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ── CSRF disabled: stateless REST API uses JWT, not cookies ──────────
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS: allow the Vite dev server and optional CRA dev server ──────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── Session: never create an HttpSession for auth state ───────────────
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Route-level authorisation ─────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(PUBLIC_PATHS).permitAll()
                    .anyRequest().authenticated())

            // ── Error responses in JSON (not Spring's default HTML error pages) ───
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((req, res, e) -> {
                        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        res.setStatus(401);
                        new ObjectMapper().writeValue(
                                res.getOutputStream(),
                                Map.of("success", false, "message", "Unauthorized"));
                    })
                    .accessDeniedHandler((req, res, e) -> {
                        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        res.setStatus(403);
                        new ObjectMapper().writeValue(
                                res.getOutputStream(),
                                Map.of("success", false, "message", "Forbidden"));
                    }))

            // ── Wire the JWT filter and the DAO auth provider ────────────────────
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS policy matched to the frontend:
     *   - Origins:  localhost:5173 (Vite) and localhost:3000 (CRA fallback)
     *   - Methods:  all REST verbs + OPTIONS (preflight)
     *   - Headers:  Authorization (JWT) and Content-Type (JSON/multipart)
     *   - Credentials allowed so the browser forwards the Authorization header
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * DaoAuthenticationProvider wires our UserDetailsService (email-based lookup)
     * and BCrypt encoder together. Spring Security uses this during form/basic auth;
     * for JWT flows it is invoked only in AuthService.login() explicitly.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /** Exposed as a bean so AuthService can inject it without a circular dependency. */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
