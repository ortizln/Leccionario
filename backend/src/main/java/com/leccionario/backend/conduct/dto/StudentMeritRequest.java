package com.leccionario.backend.conduct.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentMeritRequest {
    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "courseId is required")
    private Long courseId;

    @NotNull(message = "academicPeriodId is required")
    private Long academicPeriodId;

    @NotNull(message = "categoryId is required")
    private Long categoryId;

    @NotNull(message = "institutionId is required")
    private Long institutionId;

    private String meritDate;
    private Integer points;
    private String description;
}
