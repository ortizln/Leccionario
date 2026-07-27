package com.leccionario.backend.evaluation.domain;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.user.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "report_cards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id", "academic_period_id"})
})
public class ReportCard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_period_id", nullable = false)
    private AcademicPeriod academicPeriod;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "overall_average", precision = 5, scale = 2)
    private BigDecimal overallAverage;

    @Column(name = "final_status", length = 20)
    private String finalStatus;

    @Column(name = "teacher_comments", columnDefinition = "text")
    private String teacherComments;

    @Column(name = "conduct_notes", columnDefinition = "text")
    private String conductNotes;

    @Column(name = "attendance_summary", columnDefinition = "jsonb")
    private String attendanceSummary;

    @Column(columnDefinition = "text")
    private String observations;

    @Column(name = "generated_by", length = 100)
    private String generatedBy;

    @Column(name = "generated_at", nullable = false, updatable = false)
    private OffsetDateTime generatedAt;

    @Column(name = "signed_at")
    private OffsetDateTime signedAt;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @jakarta.persistence.PrePersist
    void onGenerate() {
        if (generatedAt == null) {
            generatedAt = OffsetDateTime.now();
        }
    }
}
