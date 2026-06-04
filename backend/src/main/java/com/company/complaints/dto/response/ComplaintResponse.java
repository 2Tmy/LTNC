package com.company.complaints.dto.response;

import com.company.complaints.enums.Category;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.enums.Priority;
import com.company.complaints.enums.ValidationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private String orderId;
    private String phone;
    private String resolution;
    private String investigationSummary;
    private String rootCause;
    private String rejectionReason;
    private ValidationStatus validationStatus;
    private List<String> evidenceFiles;
    private List<ComplaintAttachmentResponse> evidenceAttachments;
    private Category category;
    private Priority priority;
    private ComplaintStatus status;

    private int editCount;
    private LocalDateTime lastEditedAt;
    private LocalDateTime editDeadline;

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String complaintCode;

    private Long validatedById;
    private String validatedByName;

    private Long assignedToId;
    private String assignedToName;

    private Long approvedById;
    private String approvedByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime validatedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;
}
