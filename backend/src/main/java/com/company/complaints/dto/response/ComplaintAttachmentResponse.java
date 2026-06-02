package com.company.complaints.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ComplaintAttachmentResponse {

    private Long id;
    private String fileName;
    private String fileType;
    private long fileSize;
}
