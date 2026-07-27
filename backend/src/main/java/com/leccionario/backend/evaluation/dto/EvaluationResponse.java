package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class EvaluationResponse {
    private Long id;
    private Long lessonPlanId;
    private Long studentId;
    private String studentName;
    private String evaluationType;
    private Long evaluationTypeId;
    private String evaluationTypeName;
    private LocalDate evaluationDate;
    private BigDecimal weight;
    private BigDecimal maxScore;
    private BigDecimal score;
    private String feedback;
    private String courseName;
    private String subjectName;
    private String teacherName;
    private OffsetDateTime createdAt;
}
