package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.lessonplan.domain.LessonPlan;
import com.leccionario.backend.user.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "evaluations")
public class Evaluation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_plan_id", nullable = false)
    private LessonPlan lessonPlan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 120)
    private String evaluationType;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    @Column(length = 500)
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_type_id")
    private EvaluationType evaluationTypeRef;

    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight = BigDecimal.ONE;

    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore = BigDecimal.TEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scale_id")
    private GradeScale scale;
}
