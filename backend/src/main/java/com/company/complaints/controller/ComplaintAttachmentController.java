package com.company.complaints.controller;

import com.company.complaints.service.ComplaintAttachmentService;
import com.company.complaints.service.ComplaintAttachmentService.AttachmentContent;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class ComplaintAttachmentController {

    private final ComplaintAttachmentService attachmentService;

    @GetMapping("/{id}/content")
    public ResponseEntity<Resource> getContent(
            @PathVariable Long id,
            Authentication authentication) {
        AttachmentContent content = attachmentService.getContent(id, authentication);
        return ResponseEntity.ok()
                .contentType(parseMediaType(content.fileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(content.fileName(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(content.resource());
    }

    private MediaType parseMediaType(String value) {
        try {
            return MediaType.parseMediaType(value);
        } catch (IllegalArgumentException ex) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
