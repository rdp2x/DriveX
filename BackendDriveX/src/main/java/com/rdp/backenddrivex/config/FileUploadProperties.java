package com.rdp.backenddrivex.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "file.upload")
@Data
public class FileUploadProperties {
    
    private String maxFileSize = "50MB";
    private String maxRequestSize = "50MB";
    
    // All file types are now allowed by default, except for dangerous executables
    // This list is kept for reference and future configuration if needed
    private List<String> deprecatedAllowedTypes = List.of(
        // Images
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff",
        
        // Videos
        "video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov", "video/wmv", "video/flv", "video/mkv",
        
        // Audio
        "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/wma", "audio/m4a", "audio/opus",
        
        // Documents
        "application/pdf", "text/plain", "text/csv", "text/html", "text/css", "text/javascript", "application/json", "application/xml",
        
        // Office Documents
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        
        // Archives
        "application/zip", "application/x-rar-compressed", "application/x-7z-compressed"
    );
    
    // File types that are previewable in the browser
    private List<String> previewableTypes = List.of(
        // Images
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff",
        
        // Videos
        "video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov",
        
        // Audio
        "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/m4a", "audio/opus",
        
        // Documents
        "application/pdf", "text/plain", "text/csv", "text/html", "text/css", "text/javascript", "application/json", "application/xml"
    );
}