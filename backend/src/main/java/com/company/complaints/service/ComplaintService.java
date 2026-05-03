package com.company.complaints.service;

import com.company.complaints.dto.request.CreateComplaintRequest;
import com.company.complaints.dto.response.AttachmentDto;
import com.company.complaints.dto.response.ComplaintResponse;
import com.company.complaints.entity.*;
import com.company.complaints.enums.*;
import com.company.complaints.exception.CustomExceptions.*;
import com.company.complaints.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {
    
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final FileStorageService fileStorageService;
    
    @Transactional
    public ComplaintResponse createComplaint(
        CreateComplaintRequest request,
        MultipartFile[] files,
        Long customerId
    ) {
        log.info("Creating complaint for customer ID: {}", customerId);
        
        // 1. Validate customer
        User customer = userRepository.findById(customerId)
            .orElseThrow(() -> new UserNotFoundException("Customer not found"));
        
        if (!customer.isCustomer()) {
            throw new UnauthorizedException("Only customers can create complaints");
        }
        
        // 2. Create complaint
        Complaint complaint = Complaint.builder()
            .customer(customer)
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .priority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM)
            .status(ComplaintStatus.SUBMITTED)
            .editCount(0)
            .build();
        
        complaint = complaintRepository.save(complaint);
        log.info("Complaint created with ID: {}", complaint.getId());
        
        // 3. Upload files
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    uploadAttachment(complaint, file, customer, true);
                }
            }
        }
        
        // 4. Create history
        ComplaintHistory history = ComplaintHistory.builder()
            .complaint(complaint)
            .changedBy(customer)
            .actionType(ActionType.STATUS_CHANGED)
            .oldStatus(null)
            .newStatus(ComplaintStatus.SUBMITTED.name())
            .reason("Complaint created")
            .build();
        historyRepository.save(history);
        
        // 5. Random assign to CS_STAFF
        User assignedStaff = randomAssignToCSStaff();
        if (assignedStaff != null) {
            sendNotificationToStaff(complaint, assignedStaff);
        }
        
        // 6. Send notification to customer
        sendNotificationToCustomer(complaint, customer);
        
        return convertToResponse(complaint);
    }
    
    private void uploadAttachment(
        Complaint complaint,
        MultipartFile file,
        User uploadedBy,
        boolean isInitialUpload
    ) {
        try {
            if (!fileStorageService.isValidFileType(file)) {
                throw new IllegalArgumentException("Invalid file type: " + file.getContentType());
            }
            
            if (!fileStorageService.isValidFileSize(file)) {
                throw new IllegalArgumentException("File too large: " + file.getOriginalFilename());
            }
            
            String filePath = fileStorageService.storeFile(file);
            
            ComplaintAttachment attachment = ComplaintAttachment.builder()
                .complaint(complaint)
                .uploadedBy(uploadedBy)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath)
                .isEvidence(true)
                .isInitialUpload(isInitialUpload)
                .build();
            
            complaint.addAttachment(attachment);
            log.info("Uploaded: {}", file.getOriginalFilename());
            
        } catch (IOException e) {
            log.error("Failed to upload: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload file");
        }
    }
    
    private User randomAssignToCSStaff() {
        List<User> csStaffList = userRepository.findByRoleAndEnabledTrue(Role.CS_STAFF);
        
        if (csStaffList.isEmpty()) {
            log.warn("No CS_STAFF found");
            return null;
        }
        
        Random random = new Random();
        return csStaffList.get(random.nextInt(csStaffList.size()));
    }
    
    private void sendNotificationToCustomer(Complaint complaint, User customer) {
        Notification notification = Notification.builder()
            .user(customer)
            .complaint(complaint)
            .title("Complaint Received")
            .message("Your complaint has been received and will be reviewed soon.")
            .type(NotificationType.COMPLAINT_RECEIVED)
            .actionUrl("/customer/complaints/" + complaint.getId())
            .isRead(false)
            .build();
        
        notificationRepository.save(notification);
    }
    
    private void sendNotificationToStaff(Complaint complaint, User staff) {
        Notification notification = Notification.builder()
            .user(staff)
            .complaint(complaint)
            .title("New Complaint Assigned")
            .message("A new complaint has been assigned to you.")
            .type(NotificationType.ASSIGNED)
            .actionUrl("/staff/complaints/" + complaint.getId())
            .isRead(false)
            .build();
        
        notificationRepository.save(notification);
    }
    
    private ComplaintResponse convertToResponse(Complaint complaint) {
        Long daysUntilDeadline = null;
        if (complaint.getEditDeadline() != null) {
            daysUntilDeadline = complaint.getDaysUntilDeadline();
        }
        
        List<AttachmentDto> attachmentDtos = complaint.getAttachments().stream()
            .map(this::convertToAttachmentDto)
            .collect(Collectors.toList());
        
        return ComplaintResponse.builder()
            .id(complaint.getId())
            .title(complaint.getTitle())
            .description(complaint.getDescription())
            .category(complaint.getCategory())
            .priority(complaint.getPriority())
            .status(complaint.getStatus())
            .editCount(complaint.getEditCount())
            .lastEditedAt(complaint.getLastEditedAt())
            .editDeadline(complaint.getEditDeadline())
            .daysUntilDeadline(daysUntilDeadline)
            .customerId(complaint.getCustomer().getId())
            .customerName(complaint.getCustomer().getName())
            .customerEmail(complaint.getCustomer().getEmail())
            .createdAt(complaint.getCreatedAt())
            .submittedAt(complaint.getSubmittedAt())
            .validatedAt(complaint.getValidatedAt())
            .attachmentCount(complaint.getAttachments().size())
            .commentCount(complaint.getComments().size())
            .attachments(attachmentDtos)
            .build();
    }
    
    private AttachmentDto convertToAttachmentDto(ComplaintAttachment attachment) {
        return AttachmentDto.builder()
            .id(attachment.getId())
            .fileName(attachment.getFileName())
            .fileType(attachment.getFileType())
            .fileSize(attachment.getFileSize())
            .filePath(attachment.getFilePath())
            .readableFileSize(attachment.getReadableFileSize())
            .isEvidence(attachment.getIsEvidence())
            .isInitialUpload(attachment.getIsInitialUpload())
            .uploadedById(attachment.getUploadedBy().getId())
            .uploadedByName(attachment.getUploadedBy().getName())
            .uploadedAt(attachment.getUploadedAt())
            .build();
    }
}