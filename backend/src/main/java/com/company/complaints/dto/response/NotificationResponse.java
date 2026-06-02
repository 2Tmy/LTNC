package com.company.complaints.dto.response;

import com.company.complaints.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private Long complaintId;
    private String complaintCode;
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
    private boolean read;
    private LocalDateTime createdAt;
}
