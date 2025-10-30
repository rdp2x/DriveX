package com.rdp.backenddrivex.controller;

import com.rdp.backenddrivex.dto.request.ChangePasswordRequest;
import com.rdp.backenddrivex.dto.request.ForgotPasswordRequest;
import com.rdp.backenddrivex.dto.request.LoginRequest;
import com.rdp.backenddrivex.dto.request.RegisterRequest;
import com.rdp.backenddrivex.dto.request.ResetPasswordRequest;
import com.rdp.backenddrivex.dto.request.SupabaseAuthRequest;
import com.rdp.backenddrivex.dto.response.ApiResponse;
import com.rdp.backenddrivex.dto.response.AuthResponse;
import com.rdp.backenddrivex.security.UserPrincipal;
import com.rdp.backenddrivex.service.AuthService;
import com.rdp.backenddrivex.service.SupabaseAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final SupabaseAuthService supabaseAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Registration request received for username: {}", registerRequest.getName());
        
        AuthResponse authResponse = authService.register(registerRequest);
        
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for: {}", loginRequest.getEmail());
        
        AuthResponse authResponse = authService.login(loginRequest);
        
        return ResponseEntity.ok(ApiResponse.success("User logged in successfully", authResponse));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        log.info("Password change request received for user: {}", userPrincipal.getUsername());
        
        authService.changePassword(userPrincipal.getId(), changePasswordRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(@Valid @RequestBody SupabaseAuthRequest supabaseAuthRequest) {
        log.info("Google authentication request received");
        
        AuthResponse authResponse = authService.authenticateWithSupabase(supabaseAuthRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", authResponse));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        log.info("Forgot password request received for: {}", forgotPasswordRequest.getEmail());
        
        supabaseAuthService.sendPasswordResetEmail(forgotPasswordRequest.getEmail());
        
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        log.info("Password reset request received for token: {}", resetPasswordRequest.getToken());
        
        authService.resetPassword(resetPasswordRequest.getToken(), resetPasswordRequest.getNewPassword());
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        log.info("Get current user request for: {}", userPrincipal.getName());
        
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "id", userPrincipal.getId(),
            "name", userPrincipal.getName(),
            "email", userPrincipal.getEmail(),
            "createdAt", userPrincipal.getCreatedAt()
        )));
    }

    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse<String>> testEmail(@RequestParam String email) {
        log.info("Test email request for: {}", email);
        
        try {
            supabaseAuthService.sendPasswordResetEmail(email);
            return ResponseEntity.ok(ApiResponse.success("Test email sent successfully! Check your inbox and logs."));
        } catch (Exception e) {
            log.error("Test email failed: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.success("Test completed. Check the logs for configuration status."));
        }
    }
}