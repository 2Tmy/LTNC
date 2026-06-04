package com.company.complaints.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalysisStatsDto {

    private Long totalComplaints;
    private Map<String, Long> countByStatus;
    private Map<String, Long> countByCategory;
    private Double avgResolutionDays;
    private Double rejectionRate;
    private Long slaBreachCount;
    private Long slaWarningCount;

    private Long totalCustomers;
    private Long activeCustomers;
    private Long customersWithComplaints;
    private Double avgComplaintsPerCustomer;
    private List<MonthlyTrendDto> monthlyTrend;
}
