package com.company.complaints.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintFeedbackResponse {

    private Long id;
    private int rating;
    private String comment;
    private String customerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
