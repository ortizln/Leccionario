package com.leccionario.backend.demerit.dto;

import java.time.LocalDate;
import java.util.List;

public record StudentDemerResponse(
        Long id,
        Long studentId,
        String studentName,
        String enrollmentNumber,
        Long periodId,
        String periodName,
        Long courseId,
        String courseName,
        Long teacherId,
        String teacherName,
        LocalDate logDate,
        String observation,
        short totalScore,
        String status,
        String createdBy,
        List<StudentDemerDetailResponse> details,
        List<DemeritEvidenceResponse> evidences,
        List<DemeritStatusHistoryResponse> statusHistory
) {}
