package com.company.complaints.enums;


public enum ComplaintCategory {
    PRODUCT("Product"),
    SERVICE("Service"),
    DELIVERY("Delivery"),
    BILLING("Billing"),
    OTHER ("Other");
    private final String displayName;
    ComplaintCategory(String displayName) { this.displayName = displayName; }
    public String getDisplayName() { return displayName; }
}
