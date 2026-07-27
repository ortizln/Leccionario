package com.leccionario.backend.questionbank.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class QuestionResponse {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private Long categoryId;
    private String categoryName;
    private String questionType;
    private String difficulty;
    private String questionText;
    private String correctAnswer;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String explanation;
    private BigDecimal points;
    private String tags;
    private String createdBy;
    private Boolean active;
}
