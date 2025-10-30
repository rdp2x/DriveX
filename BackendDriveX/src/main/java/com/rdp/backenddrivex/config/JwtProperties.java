package com.rdp.backenddrivex.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtProperties {
    
    private String secret;
    private Long expiresIn = 3600L; // 1 hour in seconds
    private String refreshSecret;
}