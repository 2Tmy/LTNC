package com.company.complaints.dto.response;

import com.company.complaints.enums.Category;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.enums.Priority;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private ComplaintStatus status;

    private int editCount;
    private LocalDateTime lastEditedAt;
    private LocalDateTime editDeadline;

    private Long customerId;
    private String customerName;
    private String customerEmail;

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
