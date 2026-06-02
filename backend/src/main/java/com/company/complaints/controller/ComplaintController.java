package com.company.complaints.controller;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.request.UpdateComplaintRequest;
import com.company.complaints.dto.request.ProposeResolutionRequest;
import com.company.complaints.dto.request.RejectValidationRequest;
import com.company.complaints.dto.request.ValidateComplaintRequest;
import com.company.complaints.dto.response.ApiResponse;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.company.complaints.dto.response.MonthlyComplaintVolumeResponse;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    /** POST /api/complaints — customer submits a new complaint */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @ModelAttribute CreateComplaintRequest request,
            @RequestParam("evidenceFiles") List<MultipartFile> evidenceFiles,
            Authentication authentication) {

        ComplaintResponse response = complaintService.createComplaint(
                request, evidenceFiles, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted successfully", response));
    }

    /** GET /api/complaints/my — returns the authenticated customer's own complaints */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        return ApiResponse.success("My complaints retrieved",
                complaintService.getMyComplaints(authentication));
    }

    /** GET /api/complaints - admin view of all complaints, newest first */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ComplaintResponse>> getAllComplaints() {
        return ApiResponse.success("Complaints retrieved", complaintService.getAllComplaints());
    }

    /** GET /api/complaints/submitted - admin inbox: unprocessed complaints */
    @GetMapping("/submitted")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ComplaintResponse>> getSubmittedComplaints() {
        return ApiResponse.success("Submitted complaints retrieved",
                complaintService.getSubmittedComplaints());
    }


    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ApiResponse<ComplaintResponse> getComplaintByCode(
            @PathVariable String code,
            Authentication authentication
    ) {
        return ApiResponse.success(
                "Complaint retrieved successfully",
                complaintService.getComplaintByCode(code, authentication)
        );
    }

    @GetMapping("/statistics/monthly-volume")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<MonthlyComplaintVolumeResponse>> getMonthlyComplaintVolume() {
        return ApiResponse.success(
            "Monthly complaint volume retrieved successfully",
            complaintService.getMonthlyComplaintVolume()
        );}


    /**
     * PUT /api/complaints/{id}/receive - ADMIN marks a complaint as received,
     * moving it from SUBMITTED → PENDING_VALIDATION for the validation queue.
     
     */
    @PutMapping("/{id}/receive")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponse> receiveComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        return ApiResponse.success("Complaint submitted for validation",
                complaintService.submitForValidation(id, authentication));
    }
    /**
     * PUT /api/complaints/{id} — customer updates title/description
     * while complaint status is NEED_MORE_INFO.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ApiResponse<ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody UpdateComplaintRequest request,
            Authentication authentication) {

        return ApiResponse.success("Complaint updated",
                complaintService.updateComplaint(id, request, authentication));
    }

    @PutMapping("/{id}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponse> validateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ValidateComplaintRequest request,
            Authentication authentication) {
        return ApiResponse.success("Complaint validated",
                complaintService.validateComplaint(id, request, authentication));
    }

    @PutMapping("/{id}/reject-validation")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponse> rejectValidation(
            @PathVariable Long id,
            @Valid @RequestBody RejectValidationRequest request,
            Authentication authentication) {
        return ApiResponse.success("Complaint rejected",
                complaintService.rejectValidation(id, request, authentication));
    }

    @PutMapping("/{id}/resolution")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponse> proposeResolution(
            @PathVariable Long id,
            @Valid @RequestBody ProposeResolutionRequest request,
            Authentication authentication) {
        return ApiResponse.success("Resolution prepared",
                complaintService.proposeResolution(id, request, authentication));
    }

    @PutMapping("/{id}/send-response")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComplaintResponse> sendResponse(
            @PathVariable Long id,
            Authentication authentication) {
        return ApiResponse.success("Response sent",
                complaintService.sendResponse(id, authentication));
    }
}
