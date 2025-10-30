package com.rdp.backenddrivex.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rdp.backenddrivex.config.SupabaseProperties;
import com.rdp.backenddrivex.entity.User;
import com.rdp.backenddrivex.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseAuthService {

    private final SupabaseProperties supabaseProperties;
    private final UserRepository userRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    /**
     * Validates a Supabase JWT token and returns user information
     */
    public Claims validateSupabaseToken(String token) {
        try {
            // Use the Supabase JWT secret from your project settings
            SecretKey key = Keys.hmacShaKeyFor(supabaseProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
            
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Failed to validate Supabase token: {}", e.getMessage());
            throw new RuntimeException("Invalid Supabase token", e);
        }
    }

    /**
     * Gets user information from Supabase using the access token
     */
    public JsonNode getSupabaseUser(String accessToken) {
        try {
            String response = webClient.get()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/user")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("apikey", supabaseProperties.getAnon().getKey())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.error("Failed to get Supabase user: {}", e.getMessage());
            throw new RuntimeException("Failed to get user from Supabase", e);
        }
    }

    /**
     * Creates or updates a user from Supabase auth data
     */
    public User createOrUpdateUserFromSupabase(JsonNode supabaseUser) {
        String email = supabaseUser.get("email").asText();
        String name = extractUserName(supabaseUser);
        String supabaseId = supabaseUser.get("id").asText();
        
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update name if it's different (user might have updated their Google profile)
            if (!name.equals(user.getName())) {
                user.setName(name);
                user = userRepository.save(user);
                log.info("Updated existing user: {}", email);
            }
            return user;
        } else {
            // Create new user
            User newUser = new User(name, email, User.AuthProvider.GOOGLE);
            newUser = userRepository.save(newUser);
            log.info("Created new Google user: {}", email);
            return newUser;
        }
    }

    /**
     * Extracts user name from Supabase user data
     */
    private String extractUserName(JsonNode supabaseUser) {
        // Try to get name from user_metadata first
        JsonNode userMetadata = supabaseUser.get("user_metadata");
        if (userMetadata != null) {
            JsonNode fullName = userMetadata.get("full_name");
            if (fullName != null && !fullName.isNull()) {
                return fullName.asText();
            }
            
            JsonNode name = userMetadata.get("name");
            if (name != null && !name.isNull()) {
                return name.asText();
            }
        }

        // Try to get name from app_metadata
        JsonNode appMetadata = supabaseUser.get("app_metadata");
        if (appMetadata != null) {
            JsonNode provider = appMetadata.get("provider");
            if ("google".equals(provider.asText())) {
                JsonNode providers = appMetadata.get("providers");
                if (providers != null && providers.isArray() && providers.size() > 0) {
                    // For Google, the name might be in the provider data
                    return extractNameFromEmail(supabaseUser.get("email").asText());
                }
            }
        }

        // Fallback: extract name from email
        return extractNameFromEmail(supabaseUser.get("email").asText());
    }

    /**
     * Extracts a display name from email address
     */
    private String extractNameFromEmail(String email) {
        String localPart = email.substring(0, email.indexOf('@'));
        // Remove numbers and special characters, capitalize first letter
        String cleanName = localPart.replaceAll("[^a-zA-Z]", " ").trim();
        if (cleanName.isEmpty()) {
            return "User";
        }
        
        String[] parts = cleanName.split("\\s+");
        StringBuilder name = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                name.append(Character.toUpperCase(part.charAt(0)))
                    .append(part.substring(1).toLowerCase())
                    .append(" ");
            }
        }
        
        return name.toString().trim();
    }

    /**
     * Initiates password reset via Supabase Auth API
     */
    public void sendPasswordResetEmail(String email) {
        log.info("Password reset request for email: {}", email);
        
        try {
            // Check if user exists in our database
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("Password reset requested for non-existent email: {}", email);
                // Don't reveal if email exists or not for security reasons
                // Still return success to prevent email enumeration attacks
                return;
            }
            
            // Use Supabase Auth API to send password reset email
            sendSupabasePasswordResetEmail(email);
            log.info("Password reset email sent successfully via Supabase to: {}", email);
            
        } catch (Exception e) {
            log.error("Password reset failed for {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to process password reset request", e);
        }
    }

    /**
     * Sends password reset email using custom email service with Supabase SMTP configuration
     * Since we're using custom user management, we'll use our own token-based reset system
     * but leverage Supabase for email delivery through SMTP configuration
     */
    private void sendSupabasePasswordResetEmail(String email) {
        try {
            // For now, we'll use our custom email service which should be configured 
            // to use Supabase's SMTP settings or we'll implement Supabase email sending
            
            // Option 1: Use Supabase Auth API (requires user to be in Supabase Auth)
            // This might not work if users are only in your local database
            
            // Option 2: Use custom email service with proper SMTP configuration
            log.info("Sending password reset email using custom service for email: {}", email);
            emailService.sendPasswordResetEmail(email);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}