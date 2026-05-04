package com.company.complaints.entity;

import com.company.complaints.enums.ValidationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_validations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // UNIQUE — one validation record per complaint
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by", nullable = false)
    private User validatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", nullable = false, length = 50)
    private ValidationStatus validationStatus;

    @Builder.Default
    @Column(name = "is_information_complete", nullable = false)
    private boolean isInformationComplete = false;

    @Builder.Default
    @Column(name = "is_within_scope", nullable = false)
    private boolean isWithinScope = false;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // Populated when validationStatus = NEED_MORE_INFO; tells the customer what to provide
    @Column(name = "missing_information", columnDefinition = "TEXT")
    private String missingInformation;

    @Column(name = "validation_notes", columnDefinition = "TEXT")
    private String validationNotes;

    @Column(name = "validated_at", nullable = false, updatable = false)
    private LocalDateTime validatedAt;

    @PrePersist
    protected void onCreate() {
        this.validatedAt = LocalDateTime.now();
    }
}
