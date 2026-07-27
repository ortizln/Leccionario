package com.leccionario.backend.dece.dto;

public record DeceCaseDTO(
    Long id,
    Long studentId,
    String studentName,
    String caseType,
    String priority,
    String description,
    String counselorName,
    String interventions,
    String followUpNotes,
    String status,
    java.time.LocalDate openDate,
    java.time.LocalDate closeDate,
    String result,
    String createdBy
) {}
