package com.company.complaints.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Handles all JWT operations using the JJWT 0.12.x API.
 *
 * Key design decisions:
 * - HMAC-SHA256 is selected automatically by Keys.hmacShaKeyFor() when key >= 32 bytes.
 * - The secret is encoded to bytes each call (stateless — safe for injection).
 * - Claims are extracted in a single parse; a second parse would re-verify the signature.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Derives a SecretKey from the configured secret string.
     * The secret must be at least 32 UTF-8 bytes for HMAC-SHA256.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Builds a signed JWT.
     *
     * @param userDetails Spring Security principal (email is the subject)
     * @param userId      database PK stored as a custom claim
     * @param role        Role enum name stored as a custom claim
     */
    public String generateToken(UserDetails userDetails, Long userId, String role) {
        Date now       = new Date();
        Date expiresAt = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(userDetails.getUsername())   // email
                .claim("userId", userId)
                .claim("role",   role)
                .issuedAt(now)
                .expiration(expiresAt)
                .signWith(getSigningKey())            // HMAC-SHA256 inferred from key length
                .compact();
    }

    /**
     * Returns true only if the signature is valid and the token has not expired.
     * Catches all JwtException subtypes (expiry, malformed, wrong signature, etc.).
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        // Jackson deserialises numeric claims as Integer for small values; cast safely.
        Object raw = parseClaims(token).get("userId");
        return raw instanceof Integer i ? i.longValue() : (Long) raw;
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /** Internal helper — parses and returns the payload; caller handles the result. */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
