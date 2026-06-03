package com.company.complaints.controller;

import com.company.complaints.entity.Complaint;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.repository.ComplaintRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintFeedbackController {

    private final JdbcTemplate jdbcTemplate;
    private final ComplaintRepository complaintRepository;

    @PostConstruct
    void initFeedbackTable() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS complaint_feedback (
                    id           BIGSERIAL NOT NULL,
                    complaint_id BIGINT    NOT NULL,
                    rating       INTEGER   NOT NULL CHECK (rating BETWEEN 1 AND 5),
                    comment      TEXT,
                    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    CONSTRAINT pk_complaint_feedback PRIMARY KEY (id),
                    CONSTRAINT uk_complaint_feedback_complaint UNIQUE (complaint_id),
                    CONSTRAINT fk_complaint_feedback_complaint
                        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
                )
                """);
    }

    @PostMapping("/{code}/feedback")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> submitFeedback(
            @PathVariable String code,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        Complaint complaint = complaintRepository.findByComplaintCode(code)
                .orElse(null);

        if (complaint == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Complaint not found"));
        }
        if (!complaint.getCustomer().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
        }
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Feedback can only be submitted for resolved complaints"));
        }

        Integer rating = body.get("rating") instanceof Number n ? n.intValue() : null;
        String comment = body.get("comment") instanceof String s ? s.trim() : null;

        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Rating must be between 1 and 5"));
        }

        jdbcTemplate.update("""
                INSERT INTO complaint_feedback (complaint_id, rating, comment)
                VALUES (?, ?, ?)
                ON CONFLICT (complaint_id) DO UPDATE
                    SET rating = EXCLUDED.rating,
                        comment = EXCLUDED.comment,
                        submitted_at = NOW()
                """, complaint.getId(), rating, comment);

        return ResponseEntity.ok(Map.of("success", true, "message", "Feedback submitted"));
    }

    @GetMapping("/{code}/feedback")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<?> getFeedback(@PathVariable String code, Authentication authentication) {
        Complaint complaint = complaintRepository.findByComplaintCode(code).orElse(null);
        if (complaint == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Complaint not found"));
        }

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT rating, comment, submitted_at FROM complaint_feedback WHERE complaint_id = ?",
                complaint.getId());

        Object data = rows.isEmpty() ? null : rows.get(0);
        return ResponseEntity.ok(Map.of("success", true, "data", data == null ? Map.of() : data));
    }
}
