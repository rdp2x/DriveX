package com.rdp.backenddrivex.service;

import com.rdp.backenddrivex.config.FileUploadProperties;
import com.rdp.backenddrivex.dto.response.FileListResponse;
import com.rdp.backenddrivex.dto.response.FileResponse;
import com.rdp.backenddrivex.entity.File;
import com.rdp.backenddrivex.entity.User;
import com.rdp.backenddrivex.exception.BadRequestException;
import com.rdp.backenddrivex.exception.FileStorageException;
import com.rdp.backenddrivex.exception.ResourceNotFoundException;
import com.rdp.backenddrivex.repository.FileRepository;
import com.fasterxml.uuid.Generators;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final FileRepository fileRepository;
    private final SupabaseService supabaseService;
    private final FileUploadProperties fileUploadProperties;
    private final Tika tika = new Tika();

    @Transactional
    public FileResponse uploadFile(MultipartFile file, User user, String description) {
        log.info("Starting file upload for user: {}, filename: {}", user.getName(), file.getOriginalFilename());

        // Validate file
        validateFile(file);

        try {
            // Generate unique filename and storage path using user's email
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = Generators.timeBasedGenerator().generate().toString() + fileExtension;
            String storagePath = user.getEmail() + "/" + uniqueFilename;

            // Detect MIME type
            String mimeType = detectMimeType(file);
            
            // Upload to Supabase
            String publicUrl = supabaseService.uploadFile(file, storagePath);

            // Save file metadata to database
            File fileEntity = new File();
            fileEntity.setUser(user);
            fileEntity.setFilename(originalFilename);
            fileEntity.setStoragePath(storagePath);
            fileEntity.setUrl(publicUrl);
            fileEntity.setMimeType(mimeType);
            fileEntity.setSizeBytes(file.getSize());
            fileEntity.setDescription(description);

            File savedFile = fileRepository.save(fileEntity);
            
            log.info("File uploaded successfully. ID: {}, Storage Path: {}", savedFile.getId(), storagePath);
            
            return new FileResponse(savedFile);

        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new FileStorageException("Could not upload file", e);
        }
    }

    public FileListResponse getFiles(User user, int page, int size, String type, String search) {
        log.info("Getting files for user: {}, page: {}, size: {}, type: {}, search: {}", 
                user.getName(), page, size, type, search);

        Pageable pageable = PageRequest.of(page, size);
        Page<File> filePage;

        if (StringUtils.hasText(search)) {
            filePage = fileRepository.findByUserAndFilenameContainingAndNotDeleted(user, search, pageable);
        } else if (StringUtils.hasText(type) && !type.equals("all")) {
            filePage = getFilesByType(user, type, pageable);
        } else {
            filePage = fileRepository.findByUserAndNotDeleted(user, pageable);
        }

        List<FileResponse> fileResponses = filePage.getContent().stream()
                .map(FileResponse::new)
                .collect(Collectors.toList());

        return new FileListResponse(page, size, filePage.getTotalElements(), fileResponses);
    }

    private Page<File> getFilesByType(User user, String type, Pageable pageable) {
        return switch (type.toLowerCase()) {
            case "image" -> fileRepository.findByUserAndMimeTypeAndNotDeleted(user, "image/%", pageable);
            case "video" -> fileRepository.findByUserAndMimeTypeAndNotDeleted(user, "video/%", pageable);
            case "audio" -> fileRepository.findByUserAndMimeTypeAndNotDeleted(user, "audio/%", pageable);
            case "document" -> fileRepository.findByUserAndDocumentTypesAndNotDeleted(user, pageable);
            case "other" -> fileRepository.findByUserAndOtherTypesAndNotDeleted(user, pageable);
            default -> fileRepository.findByUserAndNotDeleted(user, pageable);
        };
    }

    public FileResponse getFile(UUID fileId, User user) {
        File file = fileRepository.findByIdAndUserAndNotDeleted(fileId, user)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        return new FileResponse(file);
    }

    @Transactional
    public void deleteFile(UUID fileId, User user) {
        log.info("Deleting file: {} for user: {}", fileId, user.getName());

        File file = fileRepository.findByIdAndUserAndNotDeleted(fileId, user)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        // Soft delete
        file.markAsDeleted();
        fileRepository.save(file);

        // Optionally delete from Supabase immediately (or schedule for later)
        try {
            supabaseService.deleteFile(file.getStoragePath());
        } catch (Exception e) {
            log.warn("Failed to delete file from Supabase, but marked as deleted in database: {}", e.getMessage());
        }

        log.info("File deleted successfully: {}", fileId);
    }

    @Transactional
    public void restoreFile(UUID fileId, User user) {
        log.info("Restoring file: {} for user: {}", fileId, user.getName());

        File file = fileRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));

        if (!file.getIsDeleted()) {
            throw new BadRequestException("File is not deleted");
        }

        file.restore();
        fileRepository.save(file);

        log.info("File restored successfully: {}", fileId);
    }

    public Long getStorageUsage(User user) {
        return fileRepository.calculateTotalStorageByUser(user);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        // Detect MIME type for security logging
        String mimeType = detectMimeType(file);
        log.info("Uploading file with MIME type: {}", mimeType);
        
        // Block potentially dangerous executable files for security
        if (isDangerousFile(mimeType, file.getOriginalFilename())) {
            throw new BadRequestException("File type not allowed for security reasons: " + mimeType);
        }

        // Note: Spring Boot handles max file size validation automatically
    }

    private boolean isDangerousFile(String mimeType, String filename) {
        // Block executable files and scripts that could be dangerous
        if (mimeType != null) {
            String lowerMimeType = mimeType.toLowerCase();
            if (lowerMimeType.contains("executable") || 
                lowerMimeType.contains("application/x-msdownload") ||
                lowerMimeType.contains("application/x-msdos-program") ||
                lowerMimeType.contains("application/x-msi") ||
                lowerMimeType.contains("application/x-bat") ||
                lowerMimeType.contains("application/x-sh")) {
                return true;
            }
        }
        
        if (filename != null) {
            String lowerFilename = filename.toLowerCase();
            String[] dangerousExtensions = {".exe", ".bat", ".cmd", ".com", ".scr", ".pif", 
                                          ".msi", ".dll", ".sh", ".ps1", ".vbs", ".js", ".jar"};
            for (String ext : dangerousExtensions) {
                if (lowerFilename.endsWith(ext)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    private String detectMimeType(MultipartFile file) {
        try {
            return tika.detect(file.getBytes(), file.getOriginalFilename());
        } catch (Exception e) {
            log.warn("Could not detect MIME type, falling back to content type: {}", e.getMessage());
            return file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String getMimeTypePattern(String type) {
        return switch (type.toLowerCase()) {
            case "image" -> "image/%";
            case "video" -> "video/%";
            case "audio" -> "audio/%";
            case "document" -> "%pdf%"; // Simplified - we'll use a different approach for complex document matching
            default -> "%";
        };
    }
}