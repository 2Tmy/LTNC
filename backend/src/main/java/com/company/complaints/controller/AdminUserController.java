package com.company.complaints.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        String sql = """
                SELECT id, name, email, role, enabled, created_at, updated_at
                FROM users
                ORDER BY created_at DESC NULLS LAST, id DESC
                """;

        List<Map<String, Object>> users = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", rs.getLong("id"));
            map.put("userId", rs.getLong("id")); // Safe fallback for frontend variables
            map.put("name", rs.getString("name"));
            map.put("email", rs.getString("email"));
            map.put("role", rs.getString("role"));
            map.put("enabled", rs.getBoolean("enabled"));
            map.put("status", rs.getBoolean("enabled") ? "Active" : "Inactive");
            
            java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                map.put("createdAt", createdAt.toLocalDateTime());
            }
            return map;
        });

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Users retrieved successfully",
                "data", users
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        int rows = jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
        if (rows == 0) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "User not found"
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User deleted successfully"
        ));
    }
}
