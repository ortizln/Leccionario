package com.leccionario.backend.evaluation.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class GradeResponse {
    private Long id;
    private Long evaluationId;
    private Long studentId;
    private String studentName;
    private BigDecimal score;
    private String comment;
    private String gradedBy;
    private OffsetDateTime gradedAt;
    private OffsetDateTime createdAt;
}
