package com.company.complaints.dto.request;

import com.company.complaints.enums.Priority;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ValidateComplaintRequest {

    @NotNull(message = "Handling scope must be evaluated")
    private Boolean withinScope;

    @NotNull(message = "Order reference must be evaluated")
    private Boolean orderReferenceValid;

    @NotNull(message = "Description must be evaluated")
    private Boolean descriptionValid;

    @NotNull(message = "Evidence must be evaluated")
    private Boolean evidenceValid;

    private Priority priority;

    private String validationNotes;
}
