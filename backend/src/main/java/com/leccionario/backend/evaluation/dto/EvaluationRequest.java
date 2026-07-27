package com.leccionario.backend.evaluation.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class EvaluationRequest {

    private Long id;

    @NotNull(message = "El lesson plan es requerido")
    private Long lessonPlanId;

    private Long evaluationTypeId;

    private String evaluationType;

    private LocalDate evaluationDate;

    private BigDecimal weight;

    private BigDecimal maxScore;

    private Long scaleId;

    private Long academicPeriodId;
}
