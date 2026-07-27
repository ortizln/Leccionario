package com.leccionario.backend.ai;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ai_student_profiles")
public class AiStudentProfile extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "academic_risk", precision = 5, scale = 4)
    private BigDecimal academicRisk = BigDecimal.ZERO;

    @Column(name = "attendance_risk", precision = 5, scale = 4)
    private BigDecimal attendanceRisk = BigDecimal.ZERO;

    @Column(name = "behavior_score", precision = 5, scale = 4)
    private BigDecimal behaviorScore = BigDecimal.ZERO;

    @Column(name = "engagement_score", precision = 5, scale = 4)
    private BigDecimal engagementScore = BigDecimal.ZERO;

    @Column(name = "learning_style", length = 30)
    private String learningStyle;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "last_analyzed")
    private Instant lastAnalyzed;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public BigDecimal getAcademicRisk() { return academicRisk; }
    public void setAcademicRisk(BigDecimal academicRisk) { this.academicRisk = academicRisk; }
    public BigDecimal getAttendanceRisk() { return attendanceRisk; }
    public void setAttendanceRisk(BigDecimal attendanceRisk) { this.attendanceRisk = attendanceRisk; }
    public BigDecimal getBehaviorScore() { return behaviorScore; }
    public void setBehaviorScore(BigDecimal behaviorScore) { this.behaviorScore = behaviorScore; }
    public BigDecimal getEngagementScore() { return engagementScore; }
    public void setEngagementScore(BigDecimal engagementScore) { this.engagementScore = engagementScore; }
    public String getLearningStyle() { return learningStyle; }
    public void setLearningStyle(String learningStyle) { this.learningStyle = learningStyle; }
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    public Instant getLastAnalyzed() { return lastAnalyzed; }
    public void setLastAnalyzed(Instant lastAnalyzed) { this.lastAnalyzed = lastAnalyzed; }
}
