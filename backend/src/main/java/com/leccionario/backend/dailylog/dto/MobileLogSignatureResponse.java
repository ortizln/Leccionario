package com.leccionario.backend.dailylog.dto;

public record MobileLogSignatureResponse(
        String closeToken,
        String courseName,
        String logDate,
        String status,
        String signatureType,
        String signerName,
        String signedAt) {
}
