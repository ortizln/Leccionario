package com.leccionario.backend.certificates.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CertificateRequest {
    @NotNull(message = "templateId is required")
    private Long templateId;

    @NotNull(message = "studentId is required")
    private Long studentId;

    private Long courseId;
    private Long academicPeriodId;
    private String observations;
}
