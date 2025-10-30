package com.rdp.backenddrivex.repository;

import com.rdp.backenddrivex.entity.File;
import com.rdp.backenddrivex.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileRepository extends JpaRepository<File, UUID> {

    // Find files by user (not deleted)
    @Query("SELECT f FROM File f WHERE f.user = :user AND f.isDeleted = false ORDER BY f.uploadedAt DESC")
    Page<File> findByUserAndNotDeleted(@Param("user") User user, Pageable pageable);
    
    // Find files by user and mime type (not deleted)
    @Query("SELECT f FROM File f WHERE f.user = :user AND f.mimeType LIKE :mimeTypePattern AND f.isDeleted = false ORDER BY f.uploadedAt DESC")
    Page<File> findByUserAndMimeTypeAndNotDeleted(
        @Param("user") User user, 
        @Param("mimeTypePattern") String mimeTypePattern, 
        Pageable pageable
    );
    
    // Search files by filename (not deleted)
    @Query("SELECT f FROM File f WHERE f.user = :user AND LOWER(f.filename) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND f.isDeleted = false ORDER BY f.uploadedAt DESC")
    Page<File> findByUserAndFilenameContainingAndNotDeleted(
        @Param("user") User user, 
        @Param("searchTerm") String searchTerm, 
        Pageable pageable
    );
    
    // Find file by id and user (for security check)
    Optional<File> findByIdAndUser(UUID id, User user);
    
    // Find file by id and user (not deleted)
    @Query("SELECT f FROM File f WHERE f.id = :id AND f.user = :user AND f.isDeleted = false")
    Optional<File> findByIdAndUserAndNotDeleted(@Param("id") UUID id, @Param("user") User user);
    
    // Calculate total storage used by user
    @Query("SELECT COALESCE(SUM(f.sizeBytes), 0) FROM File f WHERE f.user = :user AND f.isDeleted = false")
    Long calculateTotalStorageByUser(@Param("user") User user);
    
    // Find all deleted files (for cleanup job)
    @Query("SELECT f FROM File f WHERE f.isDeleted = true AND f.deletedAt < :cutoffDate")
    List<File> findDeletedFilesBefore(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
    
    // Find files by storage path (for validation)
    Optional<File> findByStoragePath(String storagePath);
    
    // Find document files (PDFs, text files, office documents, etc.)
    @Query("SELECT f FROM File f WHERE f.user = :user AND f.isDeleted = false AND " +
           "(f.mimeType LIKE '%pdf%' OR f.mimeType LIKE 'text/%' OR f.mimeType LIKE '%word%' OR " +
           "f.mimeType LIKE '%sheet%' OR f.mimeType LIKE '%presentation%' OR f.mimeType LIKE '%officedocument%' OR " +
           "f.mimeType LIKE '%json%' OR f.mimeType LIKE '%xml%' OR f.mimeType LIKE '%csv%') " +
           "ORDER BY f.uploadedAt DESC")
    Page<File> findByUserAndDocumentTypesAndNotDeleted(@Param("user") User user, Pageable pageable);
    
    // Find other files (not image, video, audio, or document)
    @Query("SELECT f FROM File f WHERE f.user = :user AND f.isDeleted = false AND " +
           "NOT (f.mimeType LIKE 'image/%' OR f.mimeType LIKE 'video/%' OR f.mimeType LIKE 'audio/%' OR " +
           "f.mimeType LIKE '%pdf%' OR f.mimeType LIKE 'text/%' OR f.mimeType LIKE '%word%' OR " +
           "f.mimeType LIKE '%sheet%' OR f.mimeType LIKE '%presentation%' OR f.mimeType LIKE '%officedocument%' OR " +
           "f.mimeType LIKE '%json%' OR f.mimeType LIKE '%xml%' OR f.mimeType LIKE '%csv%') " +
           "ORDER BY f.uploadedAt DESC")
    Page<File> findByUserAndOtherTypesAndNotDeleted(@Param("user") User user, Pageable pageable);
}