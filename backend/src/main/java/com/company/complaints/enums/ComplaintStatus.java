package com.company.complaints.enums;

public enum ComplaintStatus {
    SUBMITTED,          // Pending
    PENDING_VALIDATION, // Validating
    INVESTIGATING,      // Investigating
    RESOLVING,          // Resolving
    RESOLVED,           // Resolved

    REJECTED,
    NEED_MORE_INFO,
    CLOSED
}