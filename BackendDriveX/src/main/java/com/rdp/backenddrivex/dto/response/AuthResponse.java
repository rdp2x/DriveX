package com.rdp.backenddrivex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String name;
    private String email;
    
    public AuthResponse(String accessToken, Long expiresIn, String name, String email) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.name = name;
        this.email = email;
        this.tokenType = "Bearer";
    }
}