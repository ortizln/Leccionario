package com.leccionario.backend.demerit.dto;

import java.time.OffsetDateTime;

public record DemeritStatusHistoryResponse(
        Long id,
        String changedBy,
        OffsetDateTime changedAt,
        String previousStatus,
        String newStatus,
        String notes
) {}
