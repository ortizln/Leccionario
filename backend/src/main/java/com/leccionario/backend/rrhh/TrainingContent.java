package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "training_contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingContent extends BaseEntity {
    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 30)
    private String contentType = "LESSON";

    private Integer sortOrder = 0;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String resourceUrl;

    private Integer durationMinutes;

    @Column(nullable = false)
    private Long institutionId;
}
