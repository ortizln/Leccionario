package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "grades")
public class Grade extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    @Column(length = 500)
    private String comment;

    @Column(name = "graded_at", nullable = false, updatable = false)
    private OffsetDateTime gradedAt;

    @Column(name = "graded_by", length = 100)
    private String gradedBy;

    @jakarta.persistence.PrePersist
    void onGradeCreate() {
        if (gradedAt == null) {
            gradedAt = OffsetDateTime.now();
        }
    }
}
