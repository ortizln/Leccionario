package com.leccionario.backend.ai;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "ai_study_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiStudyPlan extends BaseEntity {
    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long institutionId;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(columnDefinition = "TEXT")
    private String activities;

    @Column(columnDefinition = "TEXT")
    private String resources;

    @Column(length = 30)
    private String status = "DRAFT";

    private LocalDate startDate;
    private LocalDate endDate;

    private Double progressPercent = 0.0;
}
