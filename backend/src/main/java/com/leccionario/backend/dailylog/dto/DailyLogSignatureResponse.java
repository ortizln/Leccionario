package com.leccionario.backend.dailylog.dto;

public record DailyLogSignatureResponse(
        Long id,
        String signerName,
        String signerRole,
        String signatureType,
        String signedAt,
        String notes) {
}
