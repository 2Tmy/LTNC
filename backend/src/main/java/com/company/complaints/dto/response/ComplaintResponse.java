package com.company.complaints.dto.response;

import com.company.complaints.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ComplaintResponse {

    private Long id;
    private String complaintCode;

    private String title;
    private String category;
    private String priority;
    private String orderId;
    private String description;
    private String phone;

    private List<String> evidenceFiles;

    private ComplaintStatus status;
    private String resolution;

    private Long customerId;
    private String customerName;
    private String customerEmail;

    private Long receivedById;
    private String receivedByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime receivedAt;
}