package com.leccionario.backend.evaluation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportCardRequest {
    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "courseId is required")
    private Long courseId;

    @NotNull(message = "academicPeriodId is required")
    private Long academicPeriodId;

    private String teacherComments;
    private String conductNotes;
    private String observations;
}
