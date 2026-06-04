package com.company.complaints.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {

    private int year;
    private int month;
    private long totalComplaints;
    private Map<String, Long> byCategory;
    private double avgResolutionDays;
    private long slaBreachCount;
    private long newCustomers;
}
