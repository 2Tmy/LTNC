package com.company.complaints.controller;

import com.company.complaints.dto.AnalysisResponseDto;
import com.company.complaints.dto.AnalysisStatsDto;
import com.company.complaints.dto.response.ApiResponse;
import com.company.complaints.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AnalysisStatsDto> getStats() {
        return ApiResponse.success("Analysis statistics retrieved", analysisService.getStats());
    }

    @PostMapping("/ai")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AnalysisResponseDto> generateAiAnalysis() {
        return ApiResponse.success(
                "AI analysis generated successfully",
                analysisService.generateAiAnalysis());
    }
}
