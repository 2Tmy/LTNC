package com.company.complaints.service;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.request.UpdateComplaintRequest;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.enums.Priority;
import com.company.complaints.enums.Role;
import com.company.complaints.exception.CustomExceptions.ComplaintNotFoundException;
import com.company.complaints.exception.CustomExceptions.ComplaintStateException;
import com.company.complaints.exception.CustomExceptions.UserNotFoundException;
import com.company.complaints.repository.ComplaintRepository;
import com.company.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request, Authentication authentication) {
        User customer = getCurrentUser(authentication);

        Priority priority = request.getPriority() != null ? request.getPriority() : Priority.MEDIUM;
        Complaint complaint = Complaint.builder()
                .complaintCode(generateComplaintCode())
                .customer(customer)
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .priority(priority)
                .description(request.getDescription().trim())
                .status(ComplaintStatus.SUBMITTED)
                .build();

        log.info("Customer {} submitted complaint", customer.getEmail());
        return toResponse(complaintRepository.save(complaint));
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(Authentication authentication) {
        User customer = getCurrentUser(authentication);
        return complaintRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getSubmittedComplaints() {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(ComplaintStatus.SUBMITTED)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Complaint complaint = findById(id);

        boolean isOwner = complaint.getCustomer().getId().equals(currentUser.getId());
        boolean isStaff = currentUser.getRole() == Role.CS_STAFF
                || currentUser.getRole() == Role.SPECIALIST
                || currentUser.getRole() == Role.MANAGEMENT;

        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("You do not have permission to view this complaint");
        }

        return toResponse(complaint);
    }

    /**
     * CS_STAFF action: moves a SUBMITTED complaint to PENDING_VALIDATION,
     * signalling it is ready for the validation step.
     */
    @Transactional
    public ComplaintResponse submitForValidation(Long id, Authentication authentication) {
        Complaint complaint = findById(id);

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new ComplaintStateException(
                    "Cannot submit for validation: complaint status is " + complaint.getStatus());
        }

        complaint.setStatus(ComplaintStatus.PENDING_VALIDATION);
        log.info("Complaint {} moved to PENDING_VALIDATION", id);
        return toResponse(complaintRepository.save(complaint));
    }

    /**
     * Customer action: update title/description while status is NEED_MORE_INFO.
     * Increments editCount and refreshes lastEditedAt.
     */
    @Transactional
    public ComplaintResponse updateComplaint(Long id, UpdateComplaintRequest request,
                                             Authentication authentication) {
        User customer = getCurrentUser(authentication);
        Complaint complaint = findById(id);

        if (!complaint.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You do not have permission to edit this complaint");
        }

        if (complaint.getStatus() != ComplaintStatus.NEED_MORE_INFO) {
            throw new ComplaintStateException("Complaints can only be edited when status is NEED_MORE_INFO");
        }

        if (complaint.getEditDeadline() != null
                && LocalDateTime.now().isAfter(complaint.getEditDeadline())) {
            throw new ComplaintStateException("The edit deadline has passed");
        }

        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setEditCount(complaint.getEditCount() + 1);
        complaint.setLastEditedAt(LocalDateTime.now());

        log.info("Customer {} updated complaint {} (edit #{})",
                customer.getEmail(), id, complaint.getEditCount());
        return toResponse(complaintRepository.save(complaint));
    }
    @Transactional(readOnly = true)
    public ComplaintResponse getByComplaintCode(String code) {
        Complaint complaint = complaintRepository.findByComplaintCode(code)
            .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found: " + code));

        return toResponse(complaint);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Complaint findById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found: " + id));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found: " + authentication.getName()));
    }

    private String generateComplaintCode() {
    String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);

    Long nextId = complaintRepository.findTopByOrderByIdDesc()
            .map(complaint -> complaint.getId() + 1)
            .orElse(1L);

    return String.format("RC-%s-%04d", date, nextId);
}

    private ComplaintResponse toResponse(Complaint c) {
        User validatedBy = c.getValidatedBy();
        User assignedTo  = c.getAssignedTo();
        User approvedBy  = c.getApprovedBy();

        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintCode(c.getComplaintCode())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority())
                .status(c.getStatus())
                .editCount(c.getEditCount())
                .lastEditedAt(c.getLastEditedAt())
                .editDeadline(c.getEditDeadline())
                .customerId(c.getCustomer().getId())
                .customerName(c.getCustomer().getName())
                .customerEmail(c.getCustomer().getEmail())
                .validatedById(validatedBy != null ? validatedBy.getId()   : null)
                .validatedByName(validatedBy != null ? validatedBy.getName() : null)
                .assignedToId(assignedTo != null ? assignedTo.getId()   : null)
                .assignedToName(assignedTo != null ? assignedTo.getName() : null)
                .approvedById(approvedBy != null ? approvedBy.getId()   : null)
                .approvedByName(approvedBy != null ? approvedBy.getName() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .submittedAt(c.getSubmittedAt())
                .validatedAt(c.getValidatedAt())
                .assignedAt(c.getAssignedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }
}
