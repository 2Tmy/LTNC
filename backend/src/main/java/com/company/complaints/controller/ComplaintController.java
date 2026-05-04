package com.company.complaints.controller;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.response.ApiResponse;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ComplaintResponse> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request,
            Authentication authentication
    ) {
        ComplaintResponse response = complaintService.createComplaint(request, authentication);
        return ApiResponse.success("Complaint submitted successfully", response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        return ApiResponse.success(
                "My complaints retrieved successfully",
                complaintService.getMyComplaints(authentication)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CS_STAFF', 'SPECIALIST', 'MANAGEMENT')")
    public ApiResponse<List<ComplaintResponse>> getAllComplaints() {
        return ApiResponse.success(
                "Complaints retrieved successfully",
                complaintService.getAllComplaints()
        );
    }

    @GetMapping("/submitted")
    @PreAuthorize("hasAnyRole('CS_STAFF', 'MANAGEMENT')")
    public ApiResponse<List<ComplaintResponse>> getSubmittedComplaints() {
        return ApiResponse.success(
                "Submitted complaints retrieved successfully",
                complaintService.getSubmittedComplaints()
        );
    }

    @GetMapping("/{complaintCode}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CS_STAFF', 'SPECIALIST', 'MANAGEMENT')")
    public ApiResponse<ComplaintResponse> getComplaintDetail(
            @PathVariable String complaintCode,
            Authentication authentication
    ) {
        return ApiResponse.success(
                "Complaint retrieved successfully",
                complaintService.getComplaintByCode(complaintCode, authentication)
        );
    }

    @PutMapping("/{complaintCode}/receive")
    @PreAuthorize("hasAnyRole('CS_STAFF', 'MANAGEMENT')")
    public ApiResponse<ComplaintResponse> receiveComplaint(
            @PathVariable String complaintCode,
            Authentication authentication
    ) {
        return ApiResponse.success(
                "Complaint received successfully",
                complaintService.receiveComplaint(complaintCode, authentication)
        );
    }
}