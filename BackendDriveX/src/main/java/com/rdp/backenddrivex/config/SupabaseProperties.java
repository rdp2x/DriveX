package com.rdp.backenddrivex.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "supabase")
@Data
public class SupabaseProperties {
    
    private String url;
    private Service service = new Service();
    private Bucket bucket = new Bucket();
    private Anon anon = new Anon();
    private Jwt jwt = new Jwt();
    
    @Data
    public static class Service {
        private String key;
    }
    
    @Data
    public static class Bucket {
        private String name;
    }
    
    @Data
    public static class Anon {
        private String key;
    }
    
    @Data
    public static class Jwt {
        private String secret;
    }
}