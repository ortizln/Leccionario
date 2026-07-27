package com.leccionario.backend.nee;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "special_needs")
public class SpecialNeed extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false, length = 300)
    private String diagnosis;

    @Column(name = "diagnosis_date")
    private java.time.LocalDate diagnosisDate;

    @Column(name = "need_type", nullable = false, length = 30)
    private String needType;

    @Column(nullable = false, length = 15)
    private String severity = "MODERADA";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200)
    private String professional;

    @Column(name = "professional_contact", length = 150)
    private String professionalContact;

    @Column(name = "iep_summary", columnDefinition = "TEXT")
    private String iepSummary;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVA";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public java.time.LocalDate getDiagnosisDate() { return diagnosisDate; }
    public void setDiagnosisDate(java.time.LocalDate diagnosisDate) { this.diagnosisDate = diagnosisDate; }
    public String getNeedType() { return needType; }
    public void setNeedType(String needType) { this.needType = needType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getProfessional() { return professional; }
    public void setProfessional(String professional) { this.professional = professional; }
    public String getProfessionalContact() { return professionalContact; }
    public void setProfessionalContact(String professionalContact) { this.professionalContact = professionalContact; }
    public String getIepSummary() { return iepSummary; }
    public void setIepSummary(String iepSummary) { this.iepSummary = iepSummary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
