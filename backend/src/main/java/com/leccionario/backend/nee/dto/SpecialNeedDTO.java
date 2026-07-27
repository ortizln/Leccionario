package com.leccionario.backend.nee.dto;

public record SpecialNeedDTO(
    Long id,
    Long studentId,
    String studentName,
    String diagnosis,
    java.time.LocalDate diagnosisDate,
    String needType,
    String severity,
    String description,
    String professional,
    String professionalContact,
    String iepSummary,
    String status,
    String createdBy
) {}
