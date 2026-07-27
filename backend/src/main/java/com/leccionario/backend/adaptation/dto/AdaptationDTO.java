package com.leccionario.backend.adaptation.dto;

public record AdaptationDTO(
    Long id,
    Long specialNeedsId,
    Long studentId,
    String studentName,
    Long subjectId,
    String subjectName,
    String adaptationType,
    String area,
    String description,
    String goals,
    String strategies,
    String evaluationAdjustments,
    Long periodId,
    String status,
    String createdBy
) {}
