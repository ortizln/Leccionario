package com.leccionario.backend.audit.dto;

import java.time.OffsetDateTime;

public record AuditLogResponse(
        Long id,
        String username,
        String action,
        String module,
        String details,
        OffsetDateTime createdAt) {
}
