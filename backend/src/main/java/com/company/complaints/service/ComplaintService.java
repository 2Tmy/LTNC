package com.company.complaints.service;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.request.UpdateComplaintRequest;
import com.company.complaints.dto.request.ProposeResolutionRequest;
import com.company.complaints.dto.request.RejectValidationRequest;
import com.company.complaints.dto.request.ValidateComplaintRequest;
import com.company.complaints.dto.request.SubmitFeedbackRequest;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.dto.response.ComplaintAttachmentResponse;
import com.company.complaints.dto.response.ComplaintFeedbackResponse;
import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.ComplaintAttachment;
import com.company.complaints.entity.ComplaintFeedback;
import com.company.complaints.entity.ComplaintValidation;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.enums.NotificationType;
import com.company.complaints.enums.Role;
import com.company.complaints.enums.ValidationStatus;
import com.company.complaints.exception.CustomExceptions.ComplaintNotFoundException;
import com.company.complaints.exception.CustomExceptions.ComplaintStateException;
import com.company.complaints.exception.CustomExceptions.UserNotFoundException;
import com.company.complaints.repository.ComplaintRepository;
import com.company.complaints.repository.ComplaintAttachmentRepository;
import com.company.complaints.repository.ComplaintFeedbackRepository;
import com.company.complaints.repository.ComplaintValidationRepository;
import com.company.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.company.complaints.dto.response.MonthlyComplaintVolumeResponse;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintAttachmentRepository attachmentRepository;
    private final ComplaintFeedbackRepository feedbackRepository;
    private final ComplaintValidationRepository validationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${complaints.upload-dir:uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_FILE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request,
                                             List<MultipartFile> evidenceFiles,
                                             Authentication authentication) {
        User customer = getCurrentUser(authentication);
        validateEvidenceFiles(evidenceFiles);

        Complaint complaint = Objects.requireNonNull(Complaint.builder()
                .complaintCode(generateComplaintCode())
                .customer(customer)
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .orderId(trimToNull(request.getOrderId()))
                .phone(trimToNull(request.getPhone()))
                .description(request.getDescription().trim())
                .status(ComplaintStatus.PENDING)
                .build(), "Complaint builder returned null");

        Complaint saved = saveComplaint(complaint);
        saveEvidenceFiles(saved, customer, evidenceFiles);
        notificationService.notifyCustomer(saved, NotificationType.STATUS_CHANGE,
                "Complaint submitted",
                saved.getComplaintCode() + " was submitted successfully and is waiting for receipt.");
        log.info("Customer {} submitted complaint {}", customer.getEmail(), saved.getComplaintCode());
        return toResponse(saved);
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
        return complaintRepository.findByStatusOrderByCreatedAtDesc(ComplaintStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }


    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintByCode(String code, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        Complaint complaint = complaintRepository.findByComplaintCode(code)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found: " + code));

        boolean isOwner = complaint.getCustomer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view this complaint");
        }

        return toResponse(complaint);
    }
    @Transactional(readOnly = true)
    public List<MonthlyComplaintVolumeResponse> getMonthlyComplaintVolume() {
        List<Complaint> complaints = complaintRepository.findAll();

        LocalDate now = LocalDate.now();
        LocalDate startMonth = now.minusMonths(5).withDayOfMonth(1);

        List<MonthlyComplaintVolumeResponse> result = new ArrayList<>();

        for (int i = 0; i < 6; i++) {
            LocalDate monthDate = startMonth.plusMonths(i);
            int year = monthDate.getYear();
            Month month = monthDate.getMonth();

            long count = complaints.stream()
                    .filter(c -> c.getCreatedAt() != null)
                    .filter(c -> c.getCreatedAt().getYear() == year)
                    .filter(c -> c.getCreatedAt().getMonth() == month)
                    .count();

            String label = month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(new MonthlyComplaintVolumeResponse(label, count));
        }

        return result;
    }

    /**
     * ADMIN action: moves a PENDING complaint to VALIDATING,
     * signalling it is ready for the validation step.
     */
    @Transactional
    public ComplaintResponse submitForValidation(Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Complaint complaint = findById(id);

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new ComplaintStateException(
                    "Cannot submit for validation: complaint status is " + complaint.getStatus());
        }

        complaint.setStatus(ComplaintStatus.VALIDATING);
        complaint.setValidatedBy(currentUser);
        complaint.setValidatedAt(LocalDateTime.now());
        notificationService.notifyCustomer(complaint, NotificationType.COMPLAINT_RECEIVED,
                "Complaint received",
                complaint.getComplaintCode() + " was received and is now being validated.");
        log.info("Complaint {} moved to VALIDATING by {}",
                complaint.getComplaintCode(), currentUser.getEmail());
        return toResponse(saveComplaint(complaint));
    }

    @Transactional
    public ComplaintResponse validateComplaint(Long id, ValidateComplaintRequest request,
                                               Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Complaint complaint = findById(id);
        if (complaint.getStatus() != ComplaintStatus.VALIDATING) {
            throw new ComplaintStateException(
                    "Cannot validate complaint with status " + complaint.getStatus());
        }

        if (!areAllChecklistItemsValid(request)) {
            throw new IllegalArgumentException("Complete every validation checklist item first");
        }
        if (request.getPriority() == null) {
            throw new IllegalArgumentException("Priority must be set during validation");
        }

        ComplaintValidation validation = getOrCreateValidation(id, complaint, currentUser);
        validation.setValidatedBy(currentUser);
        validation.setValidationStatus(ValidationStatus.VALID);
        applyChecklist(validation, request);
        validation.setInformationComplete(true);
        validation.setRejectionReason(null);
        validation.setValidationNotes(trimToNull(request.getValidationNotes()));
        validationRepository.save(Objects.requireNonNull(validation, "Complaint validation is required"));

        complaint.setPriority(Objects.requireNonNull(request.getPriority(), "Priority is required"));
        complaint.setStatus(ComplaintStatus.RESOLVING);
        complaint.setValidatedBy(currentUser);
        complaint.setValidatedAt(LocalDateTime.now());
        complaint.setAssignedTo(currentUser);
        complaint.setAssignedAt(LocalDateTime.now());
        notificationService.notifyCustomer(complaint, NotificationType.VALIDATION_VALID,
                "Complaint validated",
                complaint.getComplaintCode() + " passed validation and is now being resolved.");
        return toResponse(saveComplaint(complaint));
    }

    @Transactional
    public ComplaintResponse rejectValidation(Long id, RejectValidationRequest request,
                                              Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Complaint complaint = findById(id);
        if (complaint.getStatus() != ComplaintStatus.VALIDATING) {
            throw new ComplaintStateException(
                    "Cannot reject complaint with status " + complaint.getStatus());
        }
        if (!hasInvalidChecklistItem(request)) {
            throw new IllegalArgumentException("Mark at least one checklist item as invalid before rejecting");
        }

        String reason = request.getRejectionReason().trim();
        ComplaintValidation validation = getOrCreateValidation(id, complaint, currentUser);
        validation.setValidatedBy(currentUser);
        validation.setValidationStatus(ValidationStatus.INVALID);
        applyChecklist(validation, request);
        validation.setInformationComplete(false);
        validation.setRejectionReason(reason);
        validation.setValidationNotes(trimToNull(request.getValidationNotes()));
        validationRepository.save(Objects.requireNonNull(validation, "Complaint validation is required"));

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setValidatedBy(currentUser);
        complaint.setValidatedAt(LocalDateTime.now());
        complaint.setApprovedBy(currentUser);
        complaint.setResolvedAt(LocalDateTime.now());
        notificationService.notifyCustomer(complaint, NotificationType.VALIDATION_REJECTED,
                "Complaint rejected",
                complaint.getComplaintCode() + " was rejected during validation. Reason: " + reason);
        return toResponse(saveComplaint(complaint));
    }

    @Transactional
    public ComplaintResponse proposeResolution(Long id, ProposeResolutionRequest request,
                                               Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Complaint complaint = findById(id);
        if (complaint.getStatus() != ComplaintStatus.RESOLVING) {
            throw new ComplaintStateException(
                    "Cannot propose a resolution for complaint with status " + complaint.getStatus());
        }

        complaint.setRootCause(request.getRootCause().trim());
        complaint.setResolution(request.getResolution().trim());
        complaint.setAssignedTo(currentUser);
        notificationService.notifyCustomer(complaint, NotificationType.STATUS_CHANGE,
                "Resolution prepared",
                complaint.getComplaintCode() + " was reviewed and a response is being prepared.");
        return toResponse(saveComplaint(complaint));
    }

    @Transactional
    public ComplaintResponse sendResponse(Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Complaint complaint = findById(id);
        if (complaint.getStatus() != ComplaintStatus.RESOLVING) {
            throw new ComplaintStateException(
                    "Cannot send a response for complaint with status " + complaint.getStatus());
        }
        if (complaint.getResolution() == null || complaint.getResolution().isBlank()) {
            throw new ComplaintStateException("Customer resolution is required");
        }

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setApprovedBy(currentUser);
        complaint.setResolvedAt(LocalDateTime.now());
        notificationService.notifyCustomer(complaint, NotificationType.STATUS_CHANGE,
                "Complaint resolved",
                complaint.getComplaintCode() + " was resolved. Open the complaint to review the response.");
        return toResponse(saveComplaint(complaint));
    }

    @Transactional
    public ComplaintFeedbackResponse submitFeedback(String code, SubmitFeedbackRequest request,
                                                    Authentication authentication) {
        User customer = getCurrentUser(authentication);
        Complaint complaint = complaintRepository.findByComplaintCode(code)
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found: " + code));

        if (!complaint.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You do not have permission to review this complaint");
        }
        if (complaint.getStatus() != ComplaintStatus.RESOLVED
                || complaint.getResolution() == null
                || complaint.getResolution().isBlank()) {
            throw new ComplaintStateException(
                    "Feedback can only be submitted after the admin sends a resolution");
        }

        ComplaintValidation validation = validationRepository.findByComplaintId(
                Objects.requireNonNull(complaint.getId(), "Complaint ID is required")).orElse(null);
        if (validation != null && validation.getValidationStatus() == ValidationStatus.INVALID) {
            throw new ComplaintStateException("Rejected complaints cannot be reviewed");
        }

        ComplaintFeedback feedback = feedbackRepository.findByComplaintId(complaint.getId())
                .orElseGet(() -> ComplaintFeedback.builder()
                        .complaint(complaint)
                        .customer(customer)
                        .build());
        feedback.setRating(request.getRating());
        feedback.setComment(trimToNull(request.getComment()));

        ComplaintFeedback saved = feedbackRepository.save(
                Objects.requireNonNull(feedback, "Complaint feedback is required"));
        notificationService.notifyHandlingAdmin(
                complaint,
                NotificationType.CUSTOMER_FEEDBACK,
                "Customer feedback received",
                complaint.getComplaintCode() + " received a " + saved.getRating() + "-star rating.");
        return toFeedbackResponse(saved);
    }

    /**
     * Customer action: update title/description while status is PENDING.
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

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new ComplaintStateException("Complaints can only be edited while they are pending receipt");
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
        return toResponse(saveComplaint(complaint));
    }
    // ── Private helpers ───────────────────────────────────────────────────────

    private Complaint findById(Long id) {
        return complaintRepository.findById(Objects.requireNonNull(id, "Complaint ID is required"))
                .orElseThrow(() -> new ComplaintNotFoundException("Complaint not found: " + id));
    }

    private Complaint saveComplaint(Complaint complaint) {
        return Objects.requireNonNull(
                complaintRepository.save(Objects.requireNonNull(complaint, "Complaint is required")),
                "Complaint repository returned null");
    }

    private ComplaintValidation getOrCreateValidation(Long id, Complaint complaint, User currentUser) {
        return validationRepository.findByComplaintId(
                        Objects.requireNonNull(id, "Complaint ID is required"))
                .orElseGet(() -> ComplaintValidation.builder()
                        .complaint(complaint)
                        .validatedBy(currentUser)
                        .build());
    }

    private boolean areAllChecklistItemsValid(ValidateComplaintRequest request) {
        return Boolean.TRUE.equals(request.getWithinScope())
                && Boolean.TRUE.equals(request.getOrderReferenceValid())
                && Boolean.TRUE.equals(request.getDescriptionValid())
                && Boolean.TRUE.equals(request.getEvidenceValid());
    }

    private boolean hasInvalidChecklistItem(ValidateComplaintRequest request) {
        return Boolean.FALSE.equals(request.getWithinScope())
                || Boolean.FALSE.equals(request.getOrderReferenceValid())
                || Boolean.FALSE.equals(request.getDescriptionValid())
                || Boolean.FALSE.equals(request.getEvidenceValid());
    }

    private void applyChecklist(ComplaintValidation validation, ValidateComplaintRequest request) {
        validation.setWithinScope(Boolean.TRUE.equals(request.getWithinScope()));
        validation.setOrderReferenceValid(Boolean.TRUE.equals(request.getOrderReferenceValid()));
        validation.setDescriptionValid(Boolean.TRUE.equals(request.getDescriptionValid()));
        validation.setEvidenceValid(Boolean.TRUE.equals(request.getEvidenceValid()));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found: " + authentication.getName()));
    }

    private String generateComplaintCode() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);

        Long nextId = complaintRepository.findTopByOrderByIdDesc()
                .map(complaint -> Objects.requireNonNull(
                        complaint.getId(), "Persisted complaint ID is required") + 1)
                .orElse(1L);

        return String.format("RC-%s-%04d", date, nextId);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void validateEvidenceFiles(List<MultipartFile> evidenceFiles) {
        if (evidenceFiles == null || evidenceFiles.isEmpty()
                || evidenceFiles.stream().allMatch(MultipartFile::isEmpty)) {
            throw new IllegalArgumentException("At least one evidence file is required");
        }
        evidenceFiles.forEach(file -> {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Evidence files must not be empty");
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new IllegalArgumentException("Each evidence file must not exceed 10 MB");
            }
            if (!ALLOWED_FILE_TYPES.contains(file.getContentType())) {
                throw new IllegalArgumentException("Evidence files must be JPG, PNG, WEBP, or PDF");
            }
        });
    }

    private void saveEvidenceFiles(Complaint complaint, User customer,
                                   List<MultipartFile> evidenceFiles) {
        try {
            Path complaintDirectory = Path.of(uploadDir, complaint.getComplaintCode()).toAbsolutePath();
            Files.createDirectories(complaintDirectory);

            for (MultipartFile file : evidenceFiles) {
                String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "evidence");
                String safeName = Path.of(originalName).getFileName().toString();
                String storedName = UUID.randomUUID() + "-" + safeName;
                Path destination = complaintDirectory.resolve(storedName).normalize();
                if (!destination.startsWith(complaintDirectory)) {
                    throw new IllegalArgumentException("Invalid evidence filename");
                }
                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                attachmentRepository.save(Objects.requireNonNull(ComplaintAttachment.builder()
                        .complaint(complaint)
                        .uploadedBy(customer)
                        .fileName(safeName)
                        .fileType(file.getContentType())
                        .fileSize(file.getSize())
                        .filePath(destination.toString())
                        .isEvidence(true)
                        .isInitialUpload(true)
                        .build(), "Complaint attachment is required"));
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to store evidence file", ex);
        }
    }

    private ComplaintResponse toResponse(Complaint c) {
        Long complaintId = Objects.requireNonNull(c.getId(), "Persisted complaint ID is required");
        ComplaintValidation validation = validationRepository.findByComplaintId(complaintId).orElse(null);
        User validatedBy = c.getValidatedBy();
        User assignedTo  = c.getAssignedTo();
        User approvedBy  = c.getApprovedBy();
        List<ComplaintAttachment> attachments =
                attachmentRepository.findByComplaintIdOrderByUploadedAtDesc(complaintId);
        ComplaintFeedback feedback = feedbackRepository.findByComplaintId(complaintId).orElse(null);

        return ComplaintResponse.builder()
                .id(complaintId)
                .complaintCode(c.getComplaintCode())
                .title(c.getTitle())
                .description(c.getDescription())
                .orderId(c.getOrderId())
                .phone(c.getPhone())
                .resolution(c.getResolution())
                .investigationSummary(c.getInvestigationSummary())
                .rootCause(c.getRootCause())
                .rejectionReason(validation != null ? validation.getRejectionReason() : null)
                .validationStatus(validation != null ? validation.getValidationStatus() : null)
                .evidenceFiles(attachments.stream().map(ComplaintAttachment::getFileName).toList())
                .evidenceAttachments(attachments.stream()
                        .map(attachment -> ComplaintAttachmentResponse.builder()
                                .id(attachment.getId())
                                .fileName(attachment.getFileName())
                                .fileType(attachment.getFileType())
                                .fileSize(attachment.getFileSize())
                                .build())
                        .toList())
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
                .feedback(feedback != null ? toFeedbackResponse(feedback) : null)
                .build();
    }

    private ComplaintFeedbackResponse toFeedbackResponse(ComplaintFeedback feedback) {
        return ComplaintFeedbackResponse.builder()
                .id(feedback.getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .customerName(feedback.getCustomer().getName())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
