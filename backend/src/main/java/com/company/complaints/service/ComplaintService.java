package com.company.complaints.service;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.repository.ComplaintRepository;
import com.company.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request, Authentication authentication) {
        User customer = getCurrentUser(authentication);

        Complaint complaint = Complaint.builder()
                .complaintCode(generateComplaintCode())
                .customer(customer)
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .priority(request.getPriority())
                .orderId(isBlank(request.getOrderId()) ? "Not provided" : request.getOrderId().trim())
                .description(request.getDescription().trim())
                .phone(request.getPhone().trim())
                .evidenceFiles(request.getEvidenceFiles() == null ? List.of() : request.getEvidenceFiles())
                .status(ComplaintStatus.SUBMITTED)
                .resolution("No resolution has been proposed yet.")
                .build();

        return toResponse(complaintRepository.save(complaint));
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(Authentication authentication) {
        User customer = getCurrentUser(authentication);

        return complaintRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getSubmittedComplaints() {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(ComplaintStatus.SUBMITTED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintByCode(String complaintCode, Authentication authentication) {
        User currentUser = getCurrentUser(authentication); 

        Complaint complaint = complaintRepository.findByComplaintCode(complaintCode)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintCode)); 

        boolean isOwner = complaint.getCustomer().getId().equals(currentUser.getId());
        boolean isStaff = currentUser.getRole().name().equals("CS_STAFF")
                || currentUser.getRole().name().equals("SPECIALIST")
                || currentUser.getRole().name().equals("MANAGEMENT");

        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("You do not have permission to view this complaint");
        }

        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse receiveComplaint(String complaintCode, Authentication authentication) {
        User staff = getCurrentUser(authentication);

        Complaint complaint = complaintRepository.findByComplaintCode(complaintCode)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted complaints can be received");
        }

        complaint.setReceivedBy(staff);
        complaint.setReceivedAt(LocalDateTime.now());
        complaint.setStatus(ComplaintStatus.RECEIVED);

        return toResponse(complaintRepository.save(complaint));
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Current user not found"));
    }

    private String generateComplaintCode() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);

        Long nextId = complaintRepository.findTopByOrderByIdDesc()
                .map(complaint -> complaint.getId() + 1)
                .orElse(1L);

        return String.format("RC-%s-%04d", date, nextId);
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        User customer = complaint.getCustomer();
        User receivedBy = complaint.getReceivedBy();

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .complaintCode(complaint.getComplaintCode())
                .title(complaint.getTitle())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .orderId(complaint.getOrderId())
                .description(complaint.getDescription())
                .phone(complaint.getPhone())
                .evidenceFiles(complaint.getEvidenceFiles() == null ? List.of() : List.copyOf(complaint.getEvidenceFiles()))
                .status(complaint.getStatus())
                .resolution(complaint.getResolution())
                .customerId(customer.getId())
                .customerName(customer.getName())
                .customerEmail(customer.getEmail())
                .receivedById(receivedBy != null ? receivedBy.getId() : null)
                .receivedByName(receivedBy != null ? receivedBy.getName() : null)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .receivedAt(complaint.getReceivedAt())
                .build();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}