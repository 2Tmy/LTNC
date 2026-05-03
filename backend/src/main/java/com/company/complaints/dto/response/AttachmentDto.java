package com.company.complaints.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {
    
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String filePath;
    private String readableFileSize;
    
    private Boolean isEvidence;
    private Boolean isInitialUpload;
    
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}