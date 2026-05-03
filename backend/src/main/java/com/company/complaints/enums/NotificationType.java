package com.company.complaints.enums;

/**
 * NotificationType - UPDATED
 * 
 * CHANGES:
 * ✅ Added: EDIT_REMINDER, EDIT_DEADLINE_PASSED
 */
public enum NotificationType {
    
    // ==================== FUNCTION 1 ====================
    COMPLAINT_RECEIVED("Complaint Received", 
        "Your complaint has been received and is waiting for validation"),
    
    // ==================== FUNCTION 2 ====================
    VALIDATION_VALID("Complaint Validated", 
        "Your complaint is valid and will be processed"),
    
    VALIDATION_REJECTED("Complaint Rejected", 
        "Your complaint has been rejected"),
    
    VALIDATION_NEED_INFO("More Information Required", 
        "Please provide additional information to process your complaint"),
    
    // ==================== EDIT REMINDERS (NEW) ====================
    /**
     * NEW: Nhắc customer sửa (còn 2 ngày)
     */
    EDIT_REMINDER("Edit Deadline Reminder", 
        "Please update your complaint. You have 2 days left before the deadline"),
    
    /**
     * NEW: Deadline đã qua
     */
    EDIT_DEADLINE_PASSED("Edit Deadline Passed", 
        "The deadline to update your complaint has passed"),
    
    // ==================== GENERAL ====================
    STATUS_CHANGE("Status Changed", 
        "Your complaint status has been updated"),
    
    NEW_COMMENT("New Comment", 
        "There is a new comment on your complaint"),
    
    ASSIGNED("Assigned", 
        "You have been assigned to handle this complaint"),
    
    OVERDUE("Overdue", 
        "Complaint is overdue for handling");
    
    private final String displayName;
    private final String defaultMessage;
    
    NotificationType(String displayName, String defaultMessage) {
        this.displayName = displayName;
        this.defaultMessage = defaultMessage;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDefaultMessage() {
        return defaultMessage;
    }
}