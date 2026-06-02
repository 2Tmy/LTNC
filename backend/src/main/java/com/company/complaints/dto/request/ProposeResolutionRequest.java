package com.company.complaints.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProposeResolutionRequest {

    @NotBlank(message = "Investigation summary is required")
    @Size(max = 4000, message = "Investigation summary must not exceed 4000 characters")
    private String investigationSummary;

    @NotBlank(message = "Root cause is required")
    @Size(max = 2000, message = "Root cause must not exceed 2000 characters")
    private String rootCause;

    @NotBlank(message = "Customer resolution is required")
    @Size(max = 4000, message = "Customer resolution must not exceed 4000 characters")
    private String resolution;
}
