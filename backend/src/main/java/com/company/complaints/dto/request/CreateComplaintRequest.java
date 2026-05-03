package com.company.complaints.dto.request;

import com.company.complaints.enums.ComplaintCategory;
import com.company.complaints.enums.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho tạo complaint mới
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateComplaintRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @NotNull(message = "Category is required")
    private ComplaintCategory category;
    
    private ComplaintPriority priority; // Optional, default MEDIUM
}