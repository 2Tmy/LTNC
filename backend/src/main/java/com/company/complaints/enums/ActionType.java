package com.company.complaints.enums;

/**
 * ActionType - Loại thay đổi trong complaint_histories
 * 
 * ĐƠN GIẢN cho dự án sinh viên - chỉ 4 loại
 */
public enum ActionType {
    
    /**
     * Status thay đổi
     * VD: SUBMITTED → PENDING_VALIDATION → VALIDATED
     */
    STATUS_CHANGED("Status Changed", "Complaint status has been updated"),
    
    /**
     * Title hoặc Description được update
     * VD: Customer bổ sung thông tin khi NEED_MORE_INFO
     */
    INFO_UPDATED("Info Updated", "Title or description has been modified"),
    
    /**
     * File được upload
     * VD: Customer upload evidence mới
     */
    FILE_UPLOADED("File Uploaded", "New file has been uploaded"),
    
    /**
     * File bị xóa (ít khi dùng)
     */
    FILE_DELETED("File Deleted", "File has been removed");
    
    private final String displayName;
    private final String description;
    
    ActionType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}