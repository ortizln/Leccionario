package com.leccionario.backend.branding.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record BrandingSlideRequest(
        Long id,
        @NotBlank String badge,
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank
        @Pattern(regexp = "^(/api/public/assets/.*|https?://.*)$", message = "La imagen debe ser una URL valida o un recurso subido.")
        String imageUrl,
        @NotNull @Min(1) @Max(20) Integer slideOrder,
        boolean active) {
}
