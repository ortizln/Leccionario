package com.leccionario.backend.evaluation.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class GradeRequest {

    @NotNull(message = "La evaluacion es requerida")
    private Long evaluationId;

    @NotNull(message = "El estudiante es requerido")
    private Long studentId;

    @NotNull(message = "La calificacion es requerida")
    private BigDecimal score;

    private String comment;

    private String reason;
}
