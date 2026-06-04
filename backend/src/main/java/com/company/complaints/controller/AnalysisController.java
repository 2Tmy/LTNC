package com.company.complaints.controller;

import com.company.complaints.dto.AnalysisResponseDto;
import com.company.complaints.dto.response.ApiResponse;
import com.company.complaints.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalysisResponseDto>> generateAnalysis() {
        AnalysisResponseDto response = analysisService.generateAnalysis();
        return ResponseEntity.ok(ApiResponse.success("Analysis generated successfully", response));
    }
}
