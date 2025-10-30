package com.rdp.backenddrivex.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    @NotBlank(message = "Filename is required")
    @Column(nullable = false)
    private String filename;

    @NotBlank(message = "Storage path is required")
    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "url")
    private String url;

    @NotBlank(message = "MIME type is required")
    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Positive(message = "File size must be positive")
    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "description")
    private String description;

    // Constructor for creating new files
    public File(User user, String filename, String storagePath, String url, 
                String mimeType, Long sizeBytes, String description) {
        this.user = user;
        this.filename = filename;
        this.storagePath = storagePath;
        this.url = url;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
        this.description = description;
        this.isDeleted = false;
    }

    // Soft delete method
    public void markAsDeleted() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    // Restore method
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
    }

    // Helper method to get file kind from MIME type
    public String getFileKind() {
        if (mimeType == null) return "other";
        
        String lowerMimeType = mimeType.toLowerCase();
        
        if (lowerMimeType.startsWith("image/")) return "image";
        if (lowerMimeType.startsWith("video/")) return "video";
        if (lowerMimeType.startsWith("audio/")) return "audio";
        if (lowerMimeType.contains("pdf") || 
            lowerMimeType.contains("text/") || 
            lowerMimeType.contains("word") || 
            lowerMimeType.contains("sheet") ||
            lowerMimeType.contains("presentation") ||
            lowerMimeType.contains("officedocument") ||
            lowerMimeType.contains("json") ||
            lowerMimeType.contains("xml") ||
            lowerMimeType.contains("csv")) return "document";
        return "other";
    }

    // Helper method to check if file type is previewable
    public boolean isPreviewable() {
        if (mimeType == null) return false;
        
        String lowerMimeType = mimeType.toLowerCase();
        
        // Images
        if (lowerMimeType.startsWith("image/")) return true;
        
        // Videos (common web-supported formats)
        if (lowerMimeType.startsWith("video/") && 
            (lowerMimeType.contains("mp4") || lowerMimeType.contains("webm") || 
             lowerMimeType.contains("ogg") || lowerMimeType.contains("avi") || 
             lowerMimeType.contains("mov"))) return true;
        
        // Audio
        if (lowerMimeType.startsWith("audio/")) return true;
        
        // PDFs
        if (lowerMimeType.contains("pdf")) return true;
        
        // Text files and code
        if (lowerMimeType.contains("text/") || 
            lowerMimeType.contains("json") ||
            lowerMimeType.contains("xml") ||
            lowerMimeType.contains("csv") ||
            lowerMimeType.contains("html") ||
            lowerMimeType.contains("css") ||
            lowerMimeType.contains("javascript")) return true;
        
        return false;
    }
}