package com.company.complaints.controller;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.response.ApiResponse;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.entity.User;
import com.company.complaints.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Slf4j
public class ComplaintController {
    
    private final ComplaintService complaintService;
    
    /**
     * Create new complaint
     * 
     * POST /api/complaints
     * Content-Type: multipart/form-data
     * 
     * Form fields:
     * - title (required)
     * - description (required)
     * - category (required): PRODUCT|SERVICE|DELIVERY|BILLING|OTHER
     * - priority (optional): LOW|MEDIUM|HIGH|URGENT
     * - files (optional): max 10 files, 10MB each
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
        @Valid @ModelAttribute CreateComplaintRequest request,
        @RequestParam(value = "files", required = false) MultipartFile[] files,
        @AuthenticationPrincipal User currentUser
    ) {
        log.info("POST /api/complaints - User: {}, Title: {}", 
            currentUser.getEmail(), request.getTitle());
        
        // Validate max files
        if (files != null && files.length > 10) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Maximum 10 files allowed")
            );
        }
        
        // Create complaint
        ComplaintResponse response = complaintService.createComplaint(
            request, 
            files, 
            currentUser.getId()
        );
        
        log.info("Complaint created: ID={}", response.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("Complaint created successfully", response)
        );
    }
}