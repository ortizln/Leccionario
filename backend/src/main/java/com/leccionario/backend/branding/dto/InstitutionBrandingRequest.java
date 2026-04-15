package com.leccionario.backend.branding.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record InstitutionBrandingRequest(
        @NotBlank String displayName,
        @NotBlank String loginBadgeText,
        @NotBlank String loginTitle,
        @NotBlank String loginSubtitle,
        @NotBlank String loginHelperText,
        @NotBlank String shellTitle,
        @NotBlank String shellSubtitle,
        @NotBlank String mobileTitle,
        @NotBlank String mobileSubtitle,
        @Pattern(regexp = "^$|^(/api/public/assets/.*|https?://.*)$", message = "El logo principal debe ser una URL valida o un recurso subido.")
        String logoUrl,
        @Pattern(regexp = "^$|^(/api/public/assets/.*|https?://.*)$", message = "El logo de login debe ser una URL valida o un recurso subido.")
        String loginLogoUrl,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String primaryColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String secondaryColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String accentColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String backgroundColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String surfaceColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String textColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String contrastTextColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String mutedTextColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String headingLargeColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String headingMediumColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String bodyTextColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String buttonColor,
        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$") String buttonTextColor,
        @Valid List<BrandingSlideRequest> slides) {
}
