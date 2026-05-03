package com.company.complaints.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ForwardComplaintRequest {
    
    @NotNull(message = "Target user ID bắt buộc")
    private Long targetUserId;
    
    @NotBlank(message = "Target role bắt buộc")
    private String targetRole;  // SPECIALIST hoặc MANAGEMENT
    
    }