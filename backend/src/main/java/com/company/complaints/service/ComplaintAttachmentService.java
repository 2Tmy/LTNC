package com.company.complaints.service;

import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.ComplaintAttachment;
import com.company.complaints.entity.User;
import com.company.complaints.enums.Role;
import com.company.complaints.exception.CustomExceptions.AttachmentNotFoundException;
import com.company.complaints.exception.CustomExceptions.UserNotFoundException;
import com.company.complaints.repository.ComplaintAttachmentRepository;
import com.company.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ComplaintAttachmentService {

    private final ComplaintAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;

    @Value("${complaints.upload-dir:uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public AttachmentContent getContent(Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ComplaintAttachment attachment = attachmentRepository.findById(
                        Objects.requireNonNull(id, "Attachment ID is required"))
                .orElseThrow(() -> new AttachmentNotFoundException("Attachment not found: " + id));

        Complaint complaint = Objects.requireNonNull(
                attachment.getComplaint(), "Attachment complaint is required");
        Long customerId = Objects.requireNonNull(
                complaint.getCustomer().getId(), "Persisted customer ID is required");
        Long currentUserId = Objects.requireNonNull(
                currentUser.getId(), "Persisted user ID is required");
        if (currentUser.getRole() != Role.ADMIN && !customerId.equals(currentUserId)) {
            throw new AccessDeniedException("You do not have permission to view this attachment");
        }

        Path uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        Path filePath = Path.of(attachment.getFilePath()).toAbsolutePath().normalize();
        if (!filePath.startsWith(uploadRoot)
                || !Files.isRegularFile(filePath)
                || !Files.isReadable(filePath)) {
            throw new AttachmentNotFoundException("Attachment file is unavailable: " + id);
        }

        return new AttachmentContent(
                new FileSystemResource(filePath),
                attachment.getFileName(),
                attachment.getFileType());
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found: " + authentication.getName()));
    }

    public record AttachmentContent(Resource resource, String fileName, String fileType) {}
}
