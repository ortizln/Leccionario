package com.leccionario.backend.tutoring.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TutoringSessionRequest {
    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "courseId is required")
    private Long courseId;

    @NotNull(message = "academicPeriodId is required")
    private Long academicPeriodId;

    @NotNull(message = "institutionId is required")
    private Long institutionId;

    @NotNull(message = "teacherId is required")
    private Long teacherId;

    private String sessionDate;
    private String sessionTime;
    private Integer durationMinutes;
    private String sessionType;
    private String topic;
    private String description;
    private String recommendations;
    private Boolean followUpRequired;
    private String followUpDate;
}
