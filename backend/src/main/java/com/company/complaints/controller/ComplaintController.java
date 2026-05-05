package com.company.complaints.controller;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.request.UpdateComplaintRequest;
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
            @Valid @RequestBody CreateComplaintRequest request,
            Authentication authentication) {

        ComplaintResponse response = complaintService.createComplaint(request, authentication);
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

    /** GET /api/complaints — staff view of all complaints, newest first */
    @GetMapping
    @PreAuthorize("hasAnyRole('CS_STAFF', 'SPECIALIST', 'MANAGEMENT')")
    public ApiResponse<List<ComplaintResponse>> getAllComplaints() {
        return ApiResponse.success("Complaints retrieved", complaintService.getAllComplaints());
    }

    /** GET /api/complaints/submitted — CS_STAFF inbox: unprocessed complaints */
    @GetMapping("/submitted")
    @PreAuthorize("hasAnyRole('CS_STAFF', 'MANAGEMENT')")
    public ApiResponse<List<ComplaintResponse>> getSubmittedComplaints() {
        return ApiResponse.success("Submitted complaints retrieved",
                complaintService.getSubmittedComplaints());
    }

    /** GET /api/complaints/{id} — detail view; customer can only see their own */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CS_STAFF', 'SPECIALIST', 'MANAGEMENT')")
    public ApiResponse<ComplaintResponse> getComplaintById(
            @PathVariable Long id,
            Authentication authentication) {

        return ApiResponse.success("Complaint retrieved",
                complaintService.getComplaintById(id, authentication));
    }

    @GetMapping("/code/{code}")
    public ApiResponse<ComplaintResponse> getByCode(@PathVariable String code) {
        return ApiResponse.success(complaintService.getByComplaintCode(code));
    }


    /**
     * PUT /api/complaints/{id}/receive — CS_STAFF marks a complaint as received,
     * moving it from SUBMITTED → PENDING_VALIDATION for the validation queue.
     */
    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('CS_STAFF', 'MANAGEMENT')")
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
}
