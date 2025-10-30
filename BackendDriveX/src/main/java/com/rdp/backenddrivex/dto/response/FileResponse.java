package com.rdp.backenddrivex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    
    private UUID id;
    private String name;
    private String url;
    private String mimeType;
    private Long size;
    private LocalDateTime uploadedAt;
    private String kind;
    private String description;
    private Boolean isPreviewable;
    
    // Constructor from entity
    public FileResponse(com.rdp.backenddrivex.entity.File file) {
        this.id = file.getId();
        this.name = file.getFilename();
        this.url = file.getUrl();
        this.mimeType = file.getMimeType();
        this.size = file.getSizeBytes();
        this.uploadedAt = file.getUploadedAt();
        this.kind = file.getFileKind();
        this.description = file.getDescription();
        this.isPreviewable = file.isPreviewable();
    }
}