package com.leccionario.backend.certificates.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.Data;

@Data
public class CertificateResponse {
    private Long id;
    private Long institutionId;
    private Long templateId;
    private String templateName;
    private String templateType;
    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private Long courseId;
    private String courseName;
    private Long academicPeriodId;
    private String academicPeriodName;
    private String certificateNumber;
    private String status;
    private OffsetDateTime issuedAt;
    private String issuedBy;
    private LocalDate validUntil;
    private String observations;
    private String headerText;
    private String footerText;
    private List<CertificateDetailResponse> details;
    private OffsetDateTime createdAt;

    @Data
    public static class CertificateDetailResponse {
        private Long id;
        private String subjectName;
        private BigDecimal score;
        private String status;
        private String observation;
    }
}
