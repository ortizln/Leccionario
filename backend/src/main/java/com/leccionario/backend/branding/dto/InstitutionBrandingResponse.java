package com.leccionario.backend.branding.dto;

import java.util.List;

public record InstitutionBrandingResponse(
        Long institutionId,
        String institutionCode,
        String institutionName,
        String displayName,
        String loginBadgeText,
        String loginTitle,
        String loginSubtitle,
        String loginHelperText,
        String shellTitle,
        String shellSubtitle,
        String mobileTitle,
        String mobileSubtitle,
        String logoUrl,
        String loginLogoUrl,
        String primaryColor,
        String secondaryColor,
        String accentColor,
        String backgroundColor,
        String surfaceColor,
        String textColor,
        String contrastTextColor,
        String mutedTextColor,
        String headingLargeColor,
        String headingMediumColor,
        String bodyTextColor,
        String buttonColor,
        String buttonTextColor,
        List<BrandingSlideResponse> slides) {
}
