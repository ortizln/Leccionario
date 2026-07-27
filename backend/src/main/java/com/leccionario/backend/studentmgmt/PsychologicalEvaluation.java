package com.leccionario.backend.studentmgmt;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "psychological_evaluations")
public class PsychologicalEvaluation extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate = LocalDate.now();

    @Column(name = "evaluator_name", length = 200)
    private String evaluatorName;

    @Column(name = "evaluation_type", nullable = false, length = 30)
    private String evaluationType;

    @Column(length = 100)
    private String area;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String findings;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "risk_level", length = 10)
    private String riskLevel = "BAJO";

    @Column(name = "follow_up_needed")
    private Boolean followUpNeeded = false;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(nullable = false, length = 15)
    private String status = "COMPLETADA";

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public LocalDate getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(LocalDate evaluationDate) { this.evaluationDate = evaluationDate; }
    public String getEvaluatorName() { return evaluatorName; }
    public void setEvaluatorName(String evaluatorName) { this.evaluatorName = evaluatorName; }
    public String getEvaluationType() { return evaluationType; }
    public void setEvaluationType(String evaluationType) { this.evaluationType = evaluationType; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public Boolean getFollowUpNeeded() { return followUpNeeded; }
    public void setFollowUpNeeded(Boolean followUpNeeded) { this.followUpNeeded = followUpNeeded; }
    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
