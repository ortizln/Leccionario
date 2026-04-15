package com.leccionario.backend.branding.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "branding.storage")
public record BrandingStorageProperties(
        String path) {
}
