package com.company.complaints.enums;

public enum ComplaintPriority {
    LOW("Low Priority"),
    MEDIUM("Medium Priority"),
    HIGH("High Priority"),
    URGENT("Urgent Priority");
    private final String displayName;
    ComplaintPriority(String displayName) { this.displayName = displayName; }
    public String getDisplayName() { return displayName; }
}
