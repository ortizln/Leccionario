package com.leccionario.backend.ai;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_learning_styles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiLearningStyle extends BaseEntity {
    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long institutionId;

    @Column(length = 50)
    private String dominantStyle = "VISUAL";

    private Double visualScore = 0.0;
    private Double auditoryScore = 0.0;
    private Double kinestheticScore = 0.0;
    private Double readingScore = 0.0;

    private Integer assessmentCount = 0;

    @Column(columnDefinition = "TEXT")
    private String observations;
}
