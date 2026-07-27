package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "recovery_exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecoveryExam extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "original_evaluation_id")
    private Long originalEvaluationId;

    @Column(name = "exam_type", nullable = false, length = 30)
    private String examType = "SUPLETORIO";

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(length = 20)
    private String status = "PENDIENTE";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}
