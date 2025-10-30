package com.rdp.backenddrivex.controller;

import com.rdp.backenddrivex.dto.response.ApiResponse;
import com.rdp.backenddrivex.dto.response.FileListResponse;
import com.rdp.backenddrivex.dto.response.FileResponse;
import com.rdp.backenddrivex.entity.User;
import com.rdp.backenddrivex.security.UserPrincipal;
import com.rdp.backenddrivex.service.AuthService;
import com.rdp.backenddrivex.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileService fileService;
    private final AuthService authService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("File upload request from user: {}, filename: {}", 
                userPrincipal.getEmail(), file.getOriginalFilename());
        
        User user = authService.getCurrentUser();
        FileResponse fileResponse = fileService.uploadFile(file, user, description);
        
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileResponse));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<FileListResponse>> getFiles(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "type", defaultValue = "all") String type,
            @RequestParam(value = "search", required = false) String search,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Get files request from user: {}, page: {}, size: {}, type: {}, search: {}", 
                userPrincipal.getEmail(), page, size, type, search);
        
        User user = authService.getCurrentUser();
        FileListResponse fileListResponse = fileService.getFiles(user, page, size, type, search);
        
        return ResponseEntity.ok(ApiResponse.success(fileListResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> getFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Get file request from user: {}, fileId: {}", userPrincipal.getUsername(), id);
        
        User user = authService.getCurrentUser();
        FileResponse fileResponse = fileService.getFile(id, user);
        
        return ResponseEntity.ok(ApiResponse.success(fileResponse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Delete file request from user: {}, fileId: {}", userPrincipal.getUsername(), id);
        
        User user = authService.getCurrentUser();
        fileService.deleteFile(id, user);
        
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully"));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<String>> restoreFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Restore file request from user: {}, fileId: {}", userPrincipal.getUsername(), id);
        
        User user = authService.getCurrentUser();
        fileService.restoreFile(id, user);
        
        return ResponseEntity.ok(ApiResponse.success("File restored successfully"));
    }

    @GetMapping("/usage")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStorageUsage(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Storage usage request from user: {}", userPrincipal.getUsername());
        
        User user = authService.getCurrentUser();
        Long storageUsed = fileService.getStorageUsage(user);
        
        return ResponseEntity.ok(ApiResponse.success(Map.of("storageUsed", storageUsed)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDownloadUrl(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Download URL request from user: {}, fileId: {}", userPrincipal.getUsername(), id);
        
        User user = authService.getCurrentUser();
        FileResponse fileResponse = fileService.getFile(id, user);
        
        return ResponseEntity.ok(ApiResponse.success(Map.of("downloadUrl", fileResponse.getUrl())));
    }
}