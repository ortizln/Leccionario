package com.leccionario.backend.questionbank.dto;

import lombok.Data;

@Data
public class QuestionCategoryResponse {
    private Long id;
    private Long institutionId;
    private String name;
    private String description;
    private Boolean active;
}
