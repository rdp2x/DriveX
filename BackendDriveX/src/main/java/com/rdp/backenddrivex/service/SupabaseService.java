package com.rdp.backenddrivex.service;

import com.rdp.backenddrivex.config.SupabaseProperties;
import com.rdp.backenddrivex.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseService {

    private final SupabaseProperties supabaseProperties;
    private final WebClient.Builder webClientBuilder;

    public String uploadFile(MultipartFile file, String storagePath) {
        try {
            log.info("Uploading file to Supabase: {}", storagePath);

            WebClient webClient = webClientBuilder
                .baseUrl(supabaseProperties.getUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseProperties.getService().getKey())
                .build();

            String uploadUrl = "/storage/v1/object/" + supabaseProperties.getBucket().getName() + "/" + storagePath;

            // Upload file to Supabase Storage
            String response = webClient.post()
                .uri(uploadUrl)
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(BodyInserters.fromValue(file.getBytes()))
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), 
                    clientResponse -> clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Supabase upload failed with status {}: {}", clientResponse.statusCode(), errorBody);
                            return Mono.error(new FileStorageException("Failed to upload file to Supabase: " + errorBody));
                        }))
                .bodyToMono(String.class)
                .block();

            // Generate public URL
            String publicUrl = generatePublicUrl(storagePath);
            
            log.info("File uploaded successfully to Supabase. Public URL: {}", publicUrl);
            return publicUrl;

        } catch (IOException e) {
            log.error("Error reading file bytes: {}", e.getMessage());
            throw new FileStorageException("Error reading file", e);
        } catch (Exception e) {
            log.error("Error uploading file to Supabase: {}", e.getMessage());
            throw new FileStorageException("Could not upload file to Supabase", e);
        }
    }

    public void deleteFile(String storagePath) {
        try {
            log.info("Deleting file from Supabase: {}", storagePath);

            WebClient webClient = webClientBuilder
                .baseUrl(supabaseProperties.getUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseProperties.getService().getKey())
                .build();

            String deleteUrl = "/storage/v1/object/" + supabaseProperties.getBucket().getName() + "/" + storagePath;

            webClient.delete()
                .uri(deleteUrl)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(),
                    clientResponse -> clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Supabase delete failed with status {}: {}", clientResponse.statusCode(), errorBody);
                            return Mono.error(new FileStorageException("Failed to delete file from Supabase: " + errorBody));
                        }))
                .bodyToMono(String.class)
                .block();

            log.info("File deleted successfully from Supabase: {}", storagePath);

        } catch (Exception e) {
            log.error("Error deleting file from Supabase: {}", e.getMessage());
            throw new FileStorageException("Could not delete file from Supabase", e);
        }
    }

    public String generatePublicUrl(String storagePath) {
        return supabaseProperties.getUrl() + "/storage/v1/object/public/" + 
               supabaseProperties.getBucket().getName() + "/" + storagePath;
    }

    public boolean fileExists(String storagePath) {
        try {
            WebClient webClient = webClientBuilder
                .baseUrl(supabaseProperties.getUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseProperties.getService().getKey())
                .build();

            String checkUrl = "/storage/v1/object/info/public/" + supabaseProperties.getBucket().getName() + "/" + storagePath;

            webClient.head()
                .uri(checkUrl)
                .retrieve()
                .toBodilessEntity()
                .block();

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void createUserFolder(String userEmail) {
        try {
            log.info("Creating user folder for: {}", userEmail);
            
            // Create a placeholder file to ensure the folder exists
            // Supabase Storage doesn't support empty folders, so we create a .gitkeep file
            String folderPath = userEmail + "/.gitkeep";
            
            WebClient webClient = webClientBuilder
                .baseUrl(supabaseProperties.getUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseProperties.getService().getKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "text/plain")
                .build();

            String uploadUrl = "/storage/v1/object/" + supabaseProperties.getBucket().getName() + "/" + folderPath;

            webClient.post()
                .uri(uploadUrl)
                .body(BodyInserters.fromValue("# User folder placeholder"))
                .retrieve()
                .bodyToMono(String.class)
                .block();

            log.info("User folder created successfully: {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to create user folder for {}: {}", userEmail, e.getMessage());
            throw new FileStorageException("Could not create user folder", e);
        }
    }
}