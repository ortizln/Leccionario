package com.leccionario.backend.certificates.dto;

import lombok.Data;

@Data
public class CertificateTemplateResponse {
    private Long id;
    private Long institutionId;
    private String name;
    private String templateType;
    private String description;
    private String headerText;
    private String footerText;
    private Boolean requiresGrades;
    private Boolean requiresConduct;
    private Boolean active;
}
