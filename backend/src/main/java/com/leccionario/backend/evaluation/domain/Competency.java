package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "competencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competency extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "competency_type", nullable = false, length = 30)
    private String competencyType = "GENERALES";

    @Column(length = 100)
    private String area;

    @Column(name = "grade_level", length = 50)
    private String gradeLevel;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
