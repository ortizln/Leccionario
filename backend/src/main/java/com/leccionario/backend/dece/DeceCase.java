package com.leccionario.backend.dece;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "dece_cases")
public class DeceCase extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "case_type", nullable = false, length = 30)
    private String caseType;

    @Column(nullable = false, length = 10)
    private String priority = "NORMAL";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "counselor_name", length = 200)
    private String counselorName;

    @Column(columnDefinition = "TEXT")
    private String interventions;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @Column(nullable = false, length = 20)
    private String status = "ABIERTO";

    @Column(name = "open_date", nullable = false)
    private java.time.LocalDate openDate = java.time.LocalDate.now();

    @Column(name = "close_date")
    private java.time.LocalDate closeDate;

    @Column(columnDefinition = "TEXT")
    private String result;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCounselorName() { return counselorName; }
    public void setCounselorName(String counselorName) { this.counselorName = counselorName; }
    public String getInterventions() { return interventions; }
    public void setInterventions(String interventions) { this.interventions = interventions; }
    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.time.LocalDate getOpenDate() { return openDate; }
    public void setOpenDate(java.time.LocalDate openDate) { this.openDate = openDate; }
    public java.time.LocalDate getCloseDate() { return closeDate; }
    public void setCloseDate(java.time.LocalDate closeDate) { this.closeDate = closeDate; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
