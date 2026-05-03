package com.company.complaints.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ComplaintComment - Trao đổi/comment trong khiếu nại
 * 
 * is_internal:
 * - true: Ghi chú nội bộ, chỉ staff thấy
 * - false: Public comment, customer cũng thấy
 * 
 * Use cases:
 * - Customer bổ sung thông tin
 * - Staff trao đổi nội bộ
 * - Staff phản hồi customer
 * 
 * Relationship: N-1 với Complaint (nhiều comments → 1 complaint)
 */
@Entity
@Table(
    name = "complaint_comments",
    indexes = {
        @Index(name = "idx_comment_complaint", columnList = "complaint_id"),
        @Index(name = "idx_comment_user", columnList = "user_id"),
        @Index(name = "idx_comment_created", columnList = "created_at"),
        @Index(name = "idx_comment_internal", columnList = "complaint_id, is_internal")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintComment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== RELATIONSHIPS ====================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Người viết comment
    
    // ==================== CONTENT ====================
    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;
    
    @Column(name = "is_internal", nullable = false)
    @Builder.Default
    private Boolean isInternal = false;  // Default: public comment
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // ==================== HELPER METHODS ====================
    /**
     * Check xem customer có được xem không
     */
    public boolean isVisibleToCustomer() {
        return !isInternal;
    }
    
    /**
     * Check xem có phải internal note không
     */
    public boolean isInternalNote() {
        return isInternal;
    }
}