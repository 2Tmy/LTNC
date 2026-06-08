package com.company.complaints.service;

import com.company.complaints.dto.response.NotificationResponse;
import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.Notification;
import com.company.complaints.entity.User;
import com.company.complaints.enums.NotificationType;
import com.company.complaints.exception.CustomExceptions.UserNotFoundException;
import com.company.complaints.repository.NotificationRepository;
import com.company.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notifyCustomer(Complaint complaint, NotificationType type,
                               String title, String message) {
        notificationRepository.save(Objects.requireNonNull(Notification.builder()
                .user(complaint.getCustomer())
                .complaint(complaint)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl("/customer/complaints/" + complaint.getComplaintCode())
                .build(), "Notification is required"));
    }

    @Transactional
    public void notifyHandlingAdmin(Complaint complaint, NotificationType type,
                                    String title, String message) {
        User admin = complaint.getApprovedBy() != null
                ? complaint.getApprovedBy()
                : complaint.getAssignedTo() != null
                    ? complaint.getAssignedTo()
                    : complaint.getValidatedBy();
        if (admin == null) {
            return;
        }

        notificationRepository.save(Objects.requireNonNull(Notification.builder()
                .user(admin)
                .complaint(complaint)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl("/admin/complaints/" + complaint.getComplaintCode())
                .build(), "Notification is required"));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
                        Objects.requireNonNull(user.getId(), "Persisted user ID is required"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markAsRead(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Notification notification = notificationRepository.findById(
                        Objects.requireNonNull(id, "Notification ID is required"))
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Notification does not belong to the current user");
        }
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
    }

    @Transactional
    public void markAllAsRead(Authentication authentication) {
        User user = getCurrentUser(authentication);
        notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                        Objects.requireNonNull(user.getId(), "Persisted user ID is required"))
                .forEach(notification -> {
                    notification.setRead(true);
                    notification.setReadAt(LocalDateTime.now());
                });
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found: " + authentication.getName()));
    }

    private NotificationResponse toResponse(Notification notification) {
        Complaint complaint = notification.getComplaint();
        return NotificationResponse.builder()
                .id(notification.getId())
                .complaintId(complaint != null ? complaint.getId() : null)
                .complaintCode(complaint != null ? complaint.getComplaintCode() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .actionUrl(notification.getActionUrl())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
