package com.rdp.backenddrivex.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "cors")
@Data
public class CorsProperties {
    
    private List<String> allowedOrigins = List.of("http://localhost:3000", "http://127.0.0.1:3000");
}