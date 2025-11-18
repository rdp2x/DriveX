package com.rdp.backenddrivex.service;

import com.rdp.backenddrivex.config.JwtProperties;
import com.rdp.backenddrivex.dto.request.ChangePasswordRequest;
import com.rdp.backenddrivex.dto.request.LoginRequest;
import com.rdp.backenddrivex.dto.request.RegisterRequest;
import com.rdp.backenddrivex.dto.request.SupabaseAuthRequest;
import com.rdp.backenddrivex.dto.response.AuthResponse;
import com.rdp.backenddrivex.entity.User;
import com.rdp.backenddrivex.exception.BadRequestException;
import com.rdp.backenddrivex.exception.ResourceNotFoundException;
import com.rdp.backenddrivex.repository.UserRepository;
import com.rdp.backenddrivex.security.JwtTokenProvider;
import com.rdp.backenddrivex.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.Optional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;
    private final SupabaseService supabaseService;
    private final SupabaseAuthService supabaseAuthService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Registering new user with email: {}", registerRequest.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address is already in use!");
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setAuthProvider(User.AuthProvider.LOCAL);

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Create user folder in Supabase Storage
        try {
            supabaseService.createUserFolder(savedUser.getEmail());
        } catch (Exception e) {
            log.warn("Failed to create user folder for {}: {}", savedUser.getEmail(), e.getMessage());
            // Don't fail registration if folder creation fails
        }

        // Generate JWT token
        String jwt = tokenProvider.generateToken(savedUser.getId(), savedUser.getName());

        return new AuthResponse(jwt, jwtProperties.getExpiresIn(), savedUser.getName(), savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest loginRequest) {
        log.info("User login attempt for: {}", loginRequest.getEmail());

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        
        // Get user details for response
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("User logged in successfully: {}", user.getName());

        return new AuthResponse(jwt, jwtProperties.getExpiresIn(), user.getName(), user.getEmail());
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest changePasswordRequest) {
        log.info("Password change request for user ID: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Old password is incorrect");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getName());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No authenticated user found");
        }

        // Get the UserPrincipal from the authentication
        if (authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            UUID userId = userPrincipal.getId();
            return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        
        throw new BadRequestException("Invalid authentication principal");
    }

    @Transactional
    public AuthResponse authenticateWithSupabase(SupabaseAuthRequest supabaseAuthRequest) {
        log.info("Authenticating user with Supabase token");

        try {
            // Validate the Supabase JWT token and extract user info
            Claims claims = supabaseAuthService.validateSupabaseToken(supabaseAuthRequest.getAccessToken());
            
            // Extract user info from JWT claims
            String email = claims.get("email", String.class);
            String name = extractNameFromClaims(claims);
            
            if (email == null) {
                throw new BadRequestException("Email not found in Supabase token");
            }
            
            // Create or update user in our database
            User user = createOrUpdateGoogleUser(email, name);

            // Create user folder in Supabase Storage if it doesn't exist
            try {
                supabaseService.createUserFolder(user.getEmail());
            } catch (Exception e) {
                log.warn("Failed to create user folder for {}: {}", user.getEmail(), e.getMessage());
                // Don't fail authentication if folder creation fails
            }

            // Generate our own JWT token for the user
            String jwt = tokenProvider.generateToken(user.getId(), user.getName());

            log.info("Supabase authentication successful for user: {}", user.getEmail());
            return new AuthResponse(jwt, jwtProperties.getExpiresIn(), user.getName(), user.getEmail());

        } catch (Exception e) {
            log.error("Supabase authentication failed: {}", e.getMessage());
            throw new BadRequestException("Invalid Supabase authentication token");
        }
    }

    private String extractNameFromClaims(Claims claims) {
        // Try various claim fields for name
        Object userMetadata = claims.get("user_metadata");
        if (userMetadata instanceof Map) {
            Map<?, ?> metadata = (Map<?, ?>) userMetadata;
            Object fullName = metadata.get("full_name");
            if (fullName != null) {
                return fullName.toString();
            }
            Object name = metadata.get("name");
            if (name != null) {
                return name.toString();
            }
        }
        
        // Fallback to email prefix if no name found
        String email = claims.get("email", String.class);
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf("@"));
        }
        
        return "Unknown User";
    }

    private User createOrUpdateGoogleUser(String email, String name) {
        // First, try to find existing user
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
            try {
                // Create new user
                User newUser = new User(name, email, User.AuthProvider.GOOGLE);
                newUser = userRepository.save(newUser);
                log.info("Created new Google user: {}", email);
                return newUser;
            } catch (Exception e) {
                // Handle race condition - another thread might have created the user
                log.warn("Race condition detected while creating user {}, attempting to fetch existing user", email);
                Optional<User> raceUser = userRepository.findByEmail(email);
                if (raceUser.isPresent()) {
                    log.info("Found existing user after race condition: {}", email);
                    return raceUser.get();
                } else {
                    // If we still can't find the user, rethrow the original exception
                    throw e;
                }
            }
        }
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Password reset attempt with token: {}", token);
        
        // Validate the reset token
        if (!emailService.isValidResetToken(token)) {
            log.warn("Invalid or expired reset token: {}", token);
            throw new BadRequestException("Invalid or expired reset token");
        }
        
        // Get email associated with the token
        String email = emailService.getEmailForToken(token);
        if (email == null) {
            log.warn("No email found for reset token: {}", token);
            throw new BadRequestException("Invalid reset token");
        }
        
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Consume the reset token (one-time use)
        emailService.consumeResetToken(token);
        
        log.info("Password reset successfully for user: {}", email);
    }
}