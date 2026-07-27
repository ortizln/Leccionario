package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.Teacher;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "report_card_details", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"report_card_id", "subject_id"})
})
public class ReportCardDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_card_id", nullable = false)
    private ReportCard reportCard;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "average_score", precision = 5, scale = 2)
    private BigDecimal averageScore;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "teacher_comment", length = 500)
    private String teacherComment;

    @Column(name = "evaluation_count")
    private Integer evaluationCount = 0;
}
