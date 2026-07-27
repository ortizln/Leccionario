package com.leccionario.backend.audit.dto;

import java.util.Map;

public record AuditStatsResponse(
        long total,
        Map<String, Long> byModule,
        Map<String, Long> byAction,
        Map<String, Long> byUser) {
}
