package com.leccionario.backend.questionbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class QuestionRequest {
    @NotNull(message = "subjectId is required")
    private Long subjectId;

    private Long categoryId;

    @NotNull(message = "institutionId is required")
    private Long institutionId;

    private String questionType;
    private String difficulty;

    @NotBlank(message = "questionText is required")
    private String questionText;

    private String correctAnswer;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String explanation;
    private BigDecimal points;
    private String tags;
}
