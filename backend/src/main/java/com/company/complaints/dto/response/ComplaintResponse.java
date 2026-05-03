package com.company.complaints.dto.response;

import com.company.complaints.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    
    private Long id;
    private String title;
    private String description;
    private ComplaintCategory category;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    
    // Edit tracking
    private Integer editCount;
    private LocalDateTime lastEditedAt;
    private LocalDateTime editDeadline;
    private Long daysUntilDeadline;
    
    // Customer
    private Long customerId;
    private String customerName;
    private String customerEmail;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime validatedAt;
    
    // Counts
    private Integer attachmentCount;
    private Integer commentCount;
    
    // Nested (optional)
    private List<AttachmentDto> attachments;
}