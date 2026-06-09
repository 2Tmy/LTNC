package com.company.complaints.enums;

public enum ComplaintStatus {
    PENDING,    // Customer submitted; admin has not received it yet
    VALIDATING, // Admin received and is validating whether the complaint is valid
    RESOLVING,  // Validated complaint is being handled, investigated, and resolved
    RESOLVED  ,  // Complaint is completed, including rejected complaints
    VALIDATED
}
