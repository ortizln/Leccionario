package com.leccionario.backend.branding.dto;

public record BrandingSlideResponse(
        Long id,
        String badge,
        String title,
        String description,
        String imageUrl,
        Integer slideOrder,
        boolean active) {
}
