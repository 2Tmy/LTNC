package com.company.complaints.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalysisResponseDto {

    private AnalysisStatsDto stats;
    private String narrative;
    private String trendSummary;
    private String rootCause;
    private String prediction;
    private List<String> immediateActions;
    private List<String> shortTermActions;
    private List<String> weeklyActions;
    private String systemHealth;
    private String generatedAt;
}
