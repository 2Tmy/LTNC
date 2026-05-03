package com.company.complaints.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ComplaintAttachment - UPDATED
 * 
 * CHANGES:
 * ✅ Added: isInitialUpload (phân biệt file ban đầu vs file upload sau)
 */
@Entity
@Table(
    name = "complaint_attachments",
    indexes = {
        @Index(name = "idx_attachment_complaint", columnList = "complaint_id"),
        @Index(name = "idx_attachment_uploader", columnList = "uploaded_by"),
        @Index(name = "idx_attachment_type", columnList = "file_type"),
        @Index(name = "idx_attachment_evidence", columnList = "complaint_id, is_evidence")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintAttachment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== RELATIONSHIPS ====================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    
    // ==================== FILE INFO ====================
    @Column(name = "file_name", nullable = false, length = 500)
    private String fileName;
    
    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Column(name = "file_path", nullable = false, length = 1000)
    private String filePath;
    
    // ==================== METADATA ====================
    @Column(name = "is_evidence", nullable = false)
    @Builder.Default
    private Boolean isEvidence = true;
    
    /**
     * NEW: Track xem file này upload lúc nào
     * - true: Upload lúc tạo complaint (initial submit)
     * - false: Upload sau khi NEED_MORE_INFO
     */
    @Column(name = "is_initial_upload", nullable = false)
    @Builder.Default
    private Boolean isInitialUpload = false;
    
    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
    
    // ==================== HELPER METHODS ====================
    
    public String getReadableFileSize() {
        if (fileSize < 1024) {
            return fileSize + " B";
        } else if (fileSize < 1024 * 1024) {
            return String.format("%.2f KB", fileSize / 1024.0);
        } else {
            return String.format("%.2f MB", fileSize / (1024.0 * 1024.0));
        }
    }
    
    public boolean isImage() {
        return fileType != null && fileType.startsWith("image/");
    }
    
    public boolean isVideo() {
        return fileType != null && fileType.startsWith("video/");
    }
    
    public boolean isPdf() {
        return fileType != null && fileType.equals("application/pdf");
    }
}