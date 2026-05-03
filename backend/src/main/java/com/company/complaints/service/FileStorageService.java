package com.company.complaints.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Service để handle file upload/storage
 */
@Service
public class FileStorageService {
    
    @Value("${file.upload.dir:uploads}")
    private String uploadDir;
    
    /**
     * Upload file và trả về file path
     * 
     * @param file MultipartFile từ request
     * @return Relative path của file đã lưu
     */
    public String storeFile(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IOException("Cannot upload empty file");
        }
        
        // Get original filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IOException("Invalid filename");
        }
        
        // Generate unique filename: timestamp_uuid_originalname
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String newFilename = timestamp + "_" + uniqueId + "_" + originalFilename;
        
        // Create year/month directory structure: uploads/2024/05/
        String yearMonth = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        Path uploadPath = Paths.get(uploadDir, yearMonth);
        
        // Create directories if not exist
        Files.createDirectories(uploadPath);
        
        // Full path: uploads/2024/05/20240503_123456_abc12345_image.jpg
        Path targetPath = uploadPath.resolve(newFilename);
        
        // Copy file to target location
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path: /uploads/2024/05/20240503_123456_abc12345_image.jpg
        return "/" + uploadDir + "/" + yearMonth + "/" + newFilename;
    }
    
    /**
     * Delete file
     */
    public void deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }
        
        // Remove leading slash
        String relativePath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
        Path path = Paths.get(relativePath);
        
        Files.deleteIfExists(path);
    }
    
    /**
     * Validate file type (chỉ cho phép image và PDF)
     */
    public boolean isValidFileType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }
        
        return contentType.startsWith("image/") || 
               contentType.equals("application/pdf");
    }
    
    /**
     * Validate file size (max 10MB)
     */
    public boolean isValidFileSize(MultipartFile file) {
        long maxSize = 10 * 1024 * 1024; // 10MB
        return file.getSize() <= maxSize;
    }
}