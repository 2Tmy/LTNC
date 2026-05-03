package com.company.complaints.entity;

import com.company.complaints.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Complaint entity - UPDATED với edit tracking
 * 
 * CHANGES từ version cũ:
 * ✅ Added: editCount, lastEditedAt, editDeadline
 * ✅ Changed: statusHistory → histories (unified)
 * ✅ Added: Helper methods cho customer update
 */
@Entity
@Table(
    name = "complaints",
    indexes = {
        @Index(name = "idx_customer", columnList = "customer_id"),
        @Index(name = "idx_validated_by", columnList = "validated_by"),
        @Index(name = "idx_assigned_to", columnList = "assigned_to"),
        @Index(name = "idx_approved_by", columnList = "approved_by"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_priority", columnList = "priority"),
        @Index(name = "idx_status_priority", columnList = "status, priority"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_submitted_at", columnList = "submitted_at"),
        @Index(name = "idx_validated_at", columnList = "validated_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== CUSTOMER ====================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    // ==================== BASIC INFO ====================
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private ComplaintCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ComplaintPriority priority = ComplaintPriority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;
    
    // ==================== EDIT TRACKING (NEW) ====================
    @Column(name = "edit_count", nullable = false)
    @Builder.Default
    private Integer editCount = 0;
    
    @Column(name = "last_edited_at")
    private LocalDateTime lastEditedAt;
    
    @Column(name = "edit_deadline")
    private LocalDateTime editDeadline;
    
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
    
    // ==================== TIMESTAMPS ====================
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "submitted_at")
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();
    
    @Column(name = "validated_at")
    private LocalDateTime validatedAt;
    
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    // ==================== RELATIONSHIPS ====================
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintAttachment> attachments = new ArrayList<>();
    
    @OneToOne(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private ComplaintValidation validation;
    
    // CHANGED: Unified history (không còn statusHistory)
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintHistory> histories = new ArrayList<>();
    
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ComplaintComment> comments = new ArrayList<>();
    
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();



    
    
    // ==================== HELPER METHODS (EXISTING) ====================
    
    public void addAttachment(ComplaintAttachment attachment) {
        attachments.add(attachment);
        attachment.setComplaint(this);
    }
    
    public void removeAttachment(ComplaintAttachment attachment) {
        attachments.remove(attachment);
        attachment.setComplaint(null);
    }
    
    public void addComment(ComplaintComment comment) {
        comments.add(comment);
        comment.setComplaint(this);
    }
    
    public void updateStatus(ComplaintStatus newStatus) {
        this.status = newStatus;
        
        switch (newStatus) {
            case VALIDATED:
                if (this.validatedAt == null) {
                    this.validatedAt = LocalDateTime.now();
                }
                break;
            case NEED_MORE_INFO:
                // Set deadline = 7 days
                this.editDeadline = LocalDateTime.now().plusDays(7);
                break;
            case RESOLVED, CLOSED:
                if (this.resolvedAt == null) {
                    this.resolvedAt = LocalDateTime.now();
                }
                break;
            default:
                break;
        }
    }
    
    public void assignTo(User specialist) {
        this.assignedTo = specialist;
        this.assignedAt = LocalDateTime.now();
    }
    
    public boolean isValidated() {
        return status == ComplaintStatus.VALIDATED;
    }
    
    public boolean isResolved() {
        return status == ComplaintStatus.RESOLVED || status == ComplaintStatus.CLOSED;
    }
    
    public boolean isRejected() {
        return status == ComplaintStatus.REJECTED;
    }
    
    // ==================== NEW HELPER METHODS ====================
    
    /**
     * Customer update description
     */
    public void customerUpdateDescription(String newDescription, User customer) {
        String oldDescription = this.description;
        this.description = newDescription;
        
        this.editCount++;
        this.lastEditedAt = LocalDateTime.now();
        
        ComplaintHistory history = ComplaintHistory.builder()
            .complaint(this)
            .changedBy(customer)
            .actionType(ActionType.INFO_UPDATED)
            .oldDescription(oldDescription)
            .newDescription(newDescription)
            .reason("Customer updated description")
            .build();
        
        this.histories.add(history);
    }
    
    /**
     * Customer upload file
     */
    public void customerUploadFile(ComplaintAttachment attachment) {
        this.attachments.add(attachment);
        attachment.setComplaint(this);
        
        this.editCount++;
        this.lastEditedAt = LocalDateTime.now();
        
        ComplaintHistory history = ComplaintHistory.builder()
            .complaint(this)
            .changedBy(attachment.getUploadedBy())
            .actionType(ActionType.FILE_UPLOADED)
            .fileName(attachment.getFileName())
            .fileSize(attachment.getFileSize())
            .reason("Customer uploaded: " + attachment.getFileName())
            .build();
        
        this.histories.add(history);
    }
    
    /**
     * Check deadline
     */
    public boolean isEditDeadlinePassed() {
        return editDeadline != null && LocalDateTime.now().isAfter(editDeadline);
    }
    
    public long getDaysUntilDeadline() {
        if (editDeadline == null) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), editDeadline).toDays();
    }
    
    public boolean needsEditReminder() {
        return status == ComplaintStatus.NEED_MORE_INFO
            && editDeadline != null
            && getDaysUntilDeadline() <= 2
            && getDaysUntilDeadline() > 0;
    }
}