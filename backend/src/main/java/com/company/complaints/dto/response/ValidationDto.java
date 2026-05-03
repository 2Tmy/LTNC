package com.company.complaints.dto.response;

import com.company.complaints.enums.ValidationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationDto {
    
    private Long id;
    private ValidationStatus validationStatus;
    
    private Boolean isInformationComplete;
    private Boolean isWithinScope;
    
    private String rejectionReason;
    private String missingInformation;
    private String validationNotes;
    
    private Long validatedById;
    private String validatedByName;
    private LocalDateTime validatedAt;
}