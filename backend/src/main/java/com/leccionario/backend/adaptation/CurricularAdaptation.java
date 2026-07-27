package com.leccionario.backend.adaptation;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "curricular_adaptations")
public class CurricularAdaptation extends BaseEntity {

    @Column(name = "special_needs_id", nullable = false)
    private Long specialNeedsId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "adaptation_type", nullable = false, length = 25)
    private String adaptationType;

    @Column(length = 100)
    private String area;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String goals;

    @Column(columnDefinition = "TEXT")
    private String strategies;

    @Column(name = "evaluation_adjustments", columnDefinition = "TEXT")
    private String evaluationAdjustments;

    @Column(name = "period_id")
    private Long periodId;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVE";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getSpecialNeedsId() { return specialNeedsId; }
    public void setSpecialNeedsId(Long specialNeedsId) { this.specialNeedsId = specialNeedsId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public String getAdaptationType() { return adaptationType; }
    public void setAdaptationType(String adaptationType) { this.adaptationType = adaptationType; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }
    public String getStrategies() { return strategies; }
    public void setStrategies(String strategies) { this.strategies = strategies; }
    public String getEvaluationAdjustments() { return evaluationAdjustments; }
    public void setEvaluationAdjustments(String evaluationAdjustments) { this.evaluationAdjustments = evaluationAdjustments; }
    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
