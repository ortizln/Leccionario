package com.leccionario.backend.conduct.dto;

import lombok.Data;

@Data
public class MeritCategoryResponse {
    private Long id;
    private Long institutionId;
    private String name;
    private String description;
    private Integer meritPoints;
    private Boolean active;
}
