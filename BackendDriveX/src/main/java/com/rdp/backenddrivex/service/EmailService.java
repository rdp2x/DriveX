package com.rdp.backenddrivex.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@drivex.com}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    // Store reset tokens temporarily (in production, use Redis or database)
    private final ConcurrentHashMap<String, String> resetTokens = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    public void sendPasswordResetEmail(String toEmail) {
        try {
            // Generate a secure reset token
            String resetToken = generateResetToken();
            
            // Store the token with email (expires in 1 hour)
            resetTokens.put(resetToken, toEmail);
            
            // Schedule token cleanup after 1 hour
            scheduler.schedule(() -> resetTokens.remove(resetToken), 1, TimeUnit.HOURS);
            
            // Create reset URL
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            String emailBody = createPasswordResetEmailBody(resetUrl);
            
            // Try to send actual email, fallback to logging if SMTP not configured
            try {
                // Check if SMTP is properly configured
                if (isSmtpConfigured()) {
                    // Create email message
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(fromEmail);
                    message.setTo(toEmail);
                    message.setSubject("Password Reset Request - DriveX");
                    message.setText(emailBody);
                    
                    // Send email
                    mailSender.send(message);
                    log.info("✅ Password reset email sent successfully to: {}", toEmail);
                } else {
                    throw new RuntimeException("SMTP not configured");
                }
                
            } catch (Exception emailException) {
                // SMTP not configured or failed - log the email content for development
                log.warn("⚠️ SMTP not configured or failed: {}", emailException.getMessage());
                log.info("📧 === PASSWORD RESET EMAIL (WOULD BE SENT TO: {}) ===", toEmail);
                log.info("📧 Subject: Password Reset Request - DriveX");
                log.info("📧 Body:\n{}", emailBody);
                log.info("📧 Reset URL: {}", resetUrl);
                log.info("📧 === END EMAIL CONTENT ===");
                log.info("🔧 TO SEND REAL EMAILS:");
                log.info("🔧 1. Configure SMTP settings in application.properties");
                log.info("🔧 2. For Gmail: Enable 2FA and create an App Password");
                log.info("🔧 3. Set EMAIL_USERNAME and EMAIL_PASSWORD environment variables");
            }
            
        } catch (Exception e) {
            log.error("Failed to process password reset email for {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    public boolean isValidResetToken(String token) {
        return resetTokens.containsKey(token);
    }
    
    public String getEmailForToken(String token) {
        return resetTokens.get(token);
    }
    
    public void consumeResetToken(String token) {
        resetTokens.remove(token);
    }
    
    private String generateResetToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    private String createPasswordResetEmailBody(String resetUrl) {
        return """
            Hello,
            
            You have requested to reset your password for your DriveX account.
            
            Click the link below to reset your password:
            %s
            
            🔒 Security Information:
            • This link will expire in 1 hour
            • You can only use this link once
            • If you didn't request this reset, please ignore this email
            
            Need help? Contact our support team.
            
            Best regards,
            The DriveX Team
            
            ---
            This is an automated message, please do not reply to this email.
            """.formatted(resetUrl);
    }
    
    /**
     * Check if SMTP is properly configured
     */
    private boolean isSmtpConfigured() {
        try {
            // Check Spring's resolved values first (from application.properties)
            String resolvedUsername = fromEmail;
            
            // Also check environment variables and system properties
            String envUsername = System.getenv("EMAIL_USERNAME");
            String envPassword = System.getenv("EMAIL_PASSWORD");
            String propUsername = System.getProperty("EMAIL_USERNAME");
            String propPassword = System.getProperty("EMAIL_PASSWORD");
            
            // Consider configured if we have either resolved values or env variables
            boolean hasUsername = (resolvedUsername != null && !resolvedUsername.equals("noreply@drivex.com")) ||
                                 (envUsername != null && !envUsername.trim().isEmpty()) ||
                                 (propUsername != null && !propUsername.trim().isEmpty());
            
            boolean hasPassword = (envPassword != null && !envPassword.trim().isEmpty()) ||
                                 (propPassword != null && !propPassword.trim().isEmpty());
            
            boolean configured = hasUsername && hasPassword;
            
            log.debug("🔧 SMTP configuration check:");
            log.debug("   • Username configured: {}", hasUsername);
            log.debug("   • Password configured: {}", hasPassword);
            log.debug("   • Overall status: {}", configured ? "✅ Ready" : "❌ Needs configuration");
            
            return configured;
        } catch (Exception e) {
            log.debug("Error checking SMTP configuration: {}", e.getMessage());
            return false;
        }
    }
}