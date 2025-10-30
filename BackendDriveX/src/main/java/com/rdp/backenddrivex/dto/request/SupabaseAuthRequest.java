package com.rdp.backenddrivex.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupabaseAuthRequest {
    
    @NotBlank(message = "Access token is required")
    private String accessToken;
    
    private String refreshToken; // Optional - may be null for some OAuth providers
}