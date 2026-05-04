package com.company.complaints.entity;

import com.company.complaints.enums.ActionType;
import com.company.complaints.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_histories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private ActionType actionType;

    // Only populated for STATUS_CHANGED actions
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 50)
    private ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 50)
    private ComplaintStatus newStatus;

    // Only populated for INFO_UPDATED actions
    @Column(name = "old_title", length = 500)
    private String oldTitle;

    @Column(name = "new_title", length = 500)
    private String newTitle;

    @Column(name = "old_description", columnDefinition = "TEXT")
    private String oldDescription;

    @Column(name = "new_description", columnDefinition = "TEXT")
    private String newDescription;

    // Only populated for FILE_UPLOADED / FILE_DELETED actions.
    // Stored directly (no FK) so history survives after the attachment is deleted.
    @Column(name = "file_name", length = 500)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }
}
