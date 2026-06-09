
package com.company.complaints.entity;
 
import com.company.complaints.enums.Category;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.enums.Priority;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
 
/**
 * Bảng chính: gộp complaint + investigation + resolution.
 *
 * Workflow: PENDING → VALIDATING → RESOLVING → RESOLVED
 * Rejected: status = RESOLVED, validation_status = INVALID
 *
 * SLA: tính bằng app logic (15 ngày từ submitted_at), không lưu bảng riêng.
 */
@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaints_code", columnList = "complaint_code", unique = true),
    @Index(name = "idx_complaints_customer", columnList = "customer_id"),
    @Index(name = "idx_complaints_status", columnList = "status"),
    @Index(name = "idx_complaints_priority", columnList = "priority"),
    @Index(name = "idx_complaints_category", columnList = "category"),
    @Index(name = "idx_complaints_status_pri", columnList = "status, priority"),
    @Index(name = "idx_complaints_submitted", columnList = "submitted_at"),
    @Index(name = "idx_complaints_resolved", columnList = "resolved_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "complaint_code", nullable = false, unique = true, length = 50)
    private String complaintCode;
 
    // ==================== CUSTOMER INPUT ====================
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
 
    @Column(nullable = false, length = 500)
    private String title;
 
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
 
    @Column(name = "order_id", length = 100)
    private String orderId;
 
    @Column(length = 20)
    private String phone;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category;
 
    // ==================== ADMIN ASSIGNS ====================
 
    /** Admin gán priority khi validate, KHÔNG phải customer chọn */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority priority;
 
    // ==================== WORKFLOW ====================
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING;
 
    // ==================== INVESTIGATION (admin fills) ====================
 
    @Column(name = "investigation_summary", columnDefinition = "TEXT")
    private String investigationSummary;
 
    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;
 
    // ==================== RESOLUTION (admin fills) ====================
 
    @Column(columnDefinition = "TEXT")
    private String resolution;
 
    // ==================== ROLE ASSIGNMENTS ====================
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by")
    private User validatedBy;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
 
    // ==================== WORKFLOW TIMESTAMPS ====================
 
    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();
 
    @Column(name = "validated_at")
    private LocalDateTime validatedAt;
 
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
 
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
 
    // ==================== EDIT TRACKING ====================
 
    @Column(name = "edit_count", nullable = false)
    @Builder.Default
    private Integer editCount = 0;
 
    @Column(name = "last_edited_at")
    private LocalDateTime lastEditedAt;
 
    @Column(name = "edit_deadline")
    private LocalDateTime editDeadline;
 
    // ==================== AUDIT TIMESTAMPS ====================
 
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
 
    // ==================== RELATIONSHIPS ====================
 
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintAttachment> attachments = new ArrayList<>();
 
    @OneToOne(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private ComplaintValidation validation;
 
    @OneToOne(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private ComplaintFeedback feedback;
 
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt   = now;
        this.updatedAt   = now;
        this.submittedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
