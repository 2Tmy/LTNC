package com.company.complaints.enums;

/**
 * Kết quả validation của CS_STAFF
 */
public enum ValidationStatus {
    /**
     * Hợp lệ - thông tin đầy đủ và thuộc phạm vi xử lý
     */
    VALID("Hợp lệ", "Khiếu nại hợp lệ, tiến hành xử lý"),
    
    /**
     * Không hợp lệ - từ chối tiếp nhận
     */
    INVALID("Không hợp lệ", "Khiếu nại không thuộc phạm vi xử lý hoặc vi phạm quy định"),
    
    /**
     * Cần bổ sung thông tin
     */
    NEED_MORE_INFO("Cần bổ sung", "Khách hàng cần cung cấp thêm thông tin");
    
    private final String displayName;
    private final String description;
    
    ValidationStatus(String displayName, String description) {
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