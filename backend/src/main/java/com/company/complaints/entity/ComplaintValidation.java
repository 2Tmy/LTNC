package com.company.complaints.entity;

import com.company.complaints.enums.ValidationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ComplaintValidation - Kết quả validate của CS_STAFF
 * 
 * ⚠️ IMPORTANT: validated_by FK đến users.id (ĐÚNG)
 * ❌ KHÔNG phải complaints.validated_by (SAI)
 * 
 * 1-1 relationship với Complaint
 * Mỗi complaint chỉ có 1 validation record
 */
@Entity
@Table(
    name = "complaint_validations",
    indexes = {
        @Index(name = "idx_validation_complaint", columnList = "complaint_id", unique = true),
        @Index(name = "idx_validation_by", columnList = "validated_by"),
        @Index(name = "idx_validation_status", columnList = "validation_status"),
        @Index(name = "idx_validation_date", columnList = "validated_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintValidation {
    
    // ==================== PRIMARY KEY ====================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== RELATIONSHIPS ====================
    // 1-1 với Complaint
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;
    
    // ✅ FIXED: Reference đến users.id (không phải complaints.validated_by)
    // Lý do: FK chỉ có thể point đến PRIMARY KEY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by", nullable = false)
    private User validatedBy;  // CS_STAFF thực hiện validation
    
    // ==================== VALIDATION RESULT ====================
    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", nullable = false, length = 50)
    private ValidationStatus validationStatus;  // VALID, INVALID, NEED_MORE_INFO
    
    // ==================== VALIDATION CHECKS ====================
    @Column(name = "is_information_complete", nullable = false)
    @Builder.Default
    private Boolean isInformationComplete = false;  // Thông tin đầy đủ?
    
    @Column(name = "is_within_scope", nullable = false)
    @Builder.Default
    private Boolean isWithinScope = false;  // Thuộc phạm vi xử lý?
    
    // ==================== DETAILS ====================
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;  // Lý do từ chối (nếu INVALID)
    
    @Column(name = "missing_information", columnDefinition = "TEXT")
    private String missingInformation;  // Thông tin thiếu (nếu NEED_MORE_INFO)
    
    @Column(name = "validation_notes", columnDefinition = "TEXT")
    private String validationNotes;  // Ghi chú nội bộ
    
    // ==================== TIMESTAMP ====================
    @CreationTimestamp
    @Column(name = "validated_at", nullable = false, updatable = false)
    private LocalDateTime validatedAt;
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Check xem validation có VALID không
     */
    public boolean isValid() {
        return validationStatus == ValidationStatus.VALID 
            && isInformationComplete 
            && isWithinScope;
    }
    
    /**
     * Check xem có cần thêm thông tin không
     */
    public boolean needsMoreInfo() {
        return validationStatus == ValidationStatus.NEED_MORE_INFO;
    }
    
    /**
     * Check xem có bị reject không
     */
    public boolean isRejected() {
        return validationStatus == ValidationStatus.INVALID;
    }
    
    /**
     * Validate business logic
     * Throw exception nếu data không hợp lệ
     */
    @PrePersist
    @PreUpdate
    private void validateBusinessLogic() {
        // Nếu INVALID → phải có rejection_reason
        if (validationStatus == ValidationStatus.INVALID && rejectionReason == null) {
            throw new IllegalStateException("rejection_reason is required when validation_status is INVALID");
        }
        
        // Nếu NEED_MORE_INFO → phải có missing_information
        if (validationStatus == ValidationStatus.NEED_MORE_INFO && missingInformation == null) {
            throw new IllegalStateException("missing_information is required when validation_status is NEED_MORE_INFO");
        }
    }
}