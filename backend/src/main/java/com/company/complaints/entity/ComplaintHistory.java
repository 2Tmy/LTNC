package com.company.complaints.entity;

import com.company.complaints.enums.ActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ComplaintHistory - UNIFIED AUDIT TRAIL
 * 
 * Track TẤT CẢ thay đổi trong 1 bảng duy nhất:
 * - Status changes
 * - Description updates
 * - File uploads
 * 
 * Đơn giản cho dự án sinh viên!
 */
@Entity
@Table(name = "complaint_histories", indexes = {
    @Index(name = "idx_history_complaint", columnList = "complaint_id"),
    @Index(name = "idx_history_action", columnList = "action_type"),
    @Index(name = "idx_history_timeline", columnList = "complaint_id, changed_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== RELATIONSHIPS ====================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;
    
    // ==================== ACTION TYPE ====================
    /**
     * Loại thay đổi:
     * - STATUS_CHANGED: Status thay đổi
     * - INFO_UPDATED: Description/title update
     * - FILE_UPLOADED: Upload file mới
     * - FILE_DELETED: Xóa file
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private ActionType actionType;
    
    // ==================== STATUS TRACKING ====================
    // Chỉ fill khi actionType = STATUS_CHANGED
    
    @Column(name = "old_status", length = 50)
    private String oldStatus;
    
    @Column(name = "new_status", length = 50)
    private String newStatus;
    
    // ==================== INFO TRACKING ====================
    // Chỉ fill khi actionType = INFO_UPDATED
    
    @Column(name = "old_title", length = 500)
    private String oldTitle;
    
    @Column(name = "new_title", length = 500)
    private String newTitle;
    
    @Column(name = "old_description", columnDefinition = "TEXT")
    private String oldDescription;
    
    @Column(name = "new_description", columnDefinition = "TEXT")
    private String newDescription;
    
    // ==================== FILE TRACKING ====================
    // Chỉ fill khi actionType = FILE_UPLOADED / FILE_DELETED
    
    /**
     * Tên file
     * VD: "evidence.jpg", "receipt.pdf"
     */
    @Column(name = "file_name", length = 500)
    private String fileName;
    
    /**
     * Size file (bytes)
     */
    @Column(name = "file_size")
    private Long fileSize;
    
    // ==================== METADATA ====================
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Check xem có phải status change không
     */
    public boolean isStatusChange() {
        return actionType == ActionType.STATUS_CHANGED;
    }
    
    /**
     * Check xem có phải info update không
     */
    public boolean isInfoUpdate() {
        return actionType == ActionType.INFO_UPDATED;
    }
    
    /**
     * Check xem có phải file change không
     */
    public boolean isFileChange() {
        return actionType == ActionType.FILE_UPLOADED 
            || actionType == ActionType.FILE_DELETED;
    }
    
    /**
     * Get readable summary
     */
    public String getSummary() {
        return switch (actionType) {
            case STATUS_CHANGED -> 
                String.format("Status: %s → %s", oldStatus, newStatus);
            case INFO_UPDATED -> {
                if (oldDescription != null && newDescription != null) {
                    yield "Description updated";
                } else if (oldTitle != null && newTitle != null) {
                    yield "Title updated";
                } else {
                    yield "Title and description updated";
                }
            }
            case FILE_UPLOADED -> 
                String.format("Uploaded: %s (%s)", fileName, getReadableFileSize());
            case FILE_DELETED -> 
                String.format("Deleted: %s", fileName);
        };
    }
    
    /**
     * Get readable file size
     */
    private String getReadableFileSize() {
        if (fileSize == null) {
            return "unknown size";
        }
        if (fileSize < 1024) {
            return fileSize + " B";
        } else if (fileSize < 1024 * 1024) {
            return String.format("%.2f KB", fileSize / 1024.0);
        } else {
            return String.format("%.2f MB", fileSize / (1024.0 * 1024.0));
        }
    }
}