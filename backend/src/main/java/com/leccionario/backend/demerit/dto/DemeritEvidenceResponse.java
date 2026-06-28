package com.leccionario.backend.demerit.dto;

import java.time.OffsetDateTime;

public record DemeritEvidenceResponse(
        Long id,
        String fileName,
        String filePath,
        String fileType,
        OffsetDateTime uploadedAt
) {}
