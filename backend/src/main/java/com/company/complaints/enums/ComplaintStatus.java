package com.company.complaints.enums;


public enum ComplaintStatus {

    SUBMITTED("Submitted", "Complaint is submitted by customer, waiting for validation"),
    
    PENDING_VALIDATION("Pending Validation", "CS Staff is checking the validity"),
    
    VALIDATED("Validated", "Complaint is valid, waiting for assignment"),
    REJECTED("Rejected", "Complaint is invalid or out of scope"),

    NEED_MORE_INFO("Need More Information", "Customer is requested to provide more details"),
    
    IN_REVIEW("In Review", "CS Staff is reviewing and assigning to specialist"),
    INVESTIGATING("Investigating", "Specialist is investigating the issue"),

    RESOLVED("Resolved", "Complaint is resolved"),

    CLOSED("Closed", "Complaint is closed after customer acceptance"),
    REOPENED("Reopened", "Complaint is reopened");
    



    private final String displayName;
    private final String description;
    
    ComplaintStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    // ==================== BUSINESS LOGIC METHODS ====================
    /**
     * Kiểm tra xem có thể chuyển từ status này sang status khác không
     */
    public boolean canTransitionTo(ComplaintStatus newStatus) {
        switch (this) {
            case SUBMITTED:
                // Từ SUBMITTED có thể -> PENDING_VALIDATION hoặc REJECTED (nếu spam)
                return newStatus == PENDING_VALIDATION || newStatus == REJECTED;
                
            case PENDING_VALIDATION:
                // Từ PENDING_VALIDATION có thể -> VALIDATED, REJECTED, hoặc NEED_MORE_INFO
                return newStatus == VALIDATED 
                    || newStatus == REJECTED 
                    || newStatus == NEED_MORE_INFO;
                    
            case NEED_MORE_INFO:
                // Sau khi customer bổ sung -> quay lại PENDING_VALIDATION
                return newStatus == PENDING_VALIDATION || newStatus == REJECTED;
                
            case VALIDATED:
                // Sau khi validated -> IN_REVIEW (để phân công)
                return newStatus == IN_REVIEW || newStatus == REJECTED;
                
            case REJECTED:
                // REJECTED là terminal state (không chuyển được)
                return false;
                
            case IN_REVIEW:
                return newStatus == INVESTIGATING || newStatus == REJECTED;
                
            case INVESTIGATING:
                return newStatus == RESOLVED || newStatus == IN_REVIEW;
                
            case RESOLVED:
                return newStatus == CLOSED || newStatus == INVESTIGATING;
                
            case CLOSED:
                // CLOSED là terminal state
                return false;
                
            default:
                return false;
        }
    }
    
    /**
     * Các status cần customer action
     */
    public boolean requiresCustomerAction() {
        return this == NEED_MORE_INFO;
    }
    
    /**
     * Các status đã hoàn tất (terminal states)
     */
    public boolean isFinalStatus() {
        return this == REJECTED || this == CLOSED;
    }
}