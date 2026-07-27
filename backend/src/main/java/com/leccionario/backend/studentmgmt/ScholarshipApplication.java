package com.leccionario.backend.studentmgmt;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "scholarship_applications")
public class ScholarshipApplication extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "type_id", nullable = false)
    private Long typeId;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate = LocalDate.now();

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Column(name = "family_income", precision = 10, scale = 2)
    private BigDecimal familyIncome;

    @Column(name = "siblings_in_school")
    private Integer siblingsInSchool = 0;

    @Column(precision = 4, scale = 2)
    private BigDecimal gpa;

    @Column(name = "documents_url", columnDefinition = "TEXT")
    private String documentsUrl;

    @Column(nullable = false, length = 15)
    private String status = "PENDIENTE";

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(name = "award_amount", precision = 10, scale = 2)
    private BigDecimal awardAmount;

    @Column(columnDefinition = "TEXT")
    private String observations;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
    public BigDecimal getFamilyIncome() { return familyIncome; }
    public void setFamilyIncome(BigDecimal familyIncome) { this.familyIncome = familyIncome; }
    public Integer getSiblingsInSchool() { return siblingsInSchool; }
    public void setSiblingsInSchool(Integer siblingsInSchool) { this.siblingsInSchool = siblingsInSchool; }
    public BigDecimal getGpa() { return gpa; }
    public void setGpa(BigDecimal gpa) { this.gpa = gpa; }
    public String getDocumentsUrl() { return documentsUrl; }
    public void setDocumentsUrl(String documentsUrl) { this.documentsUrl = documentsUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    public LocalDate getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; }
    public BigDecimal getAwardAmount() { return awardAmount; }
    public void setAwardAmount(BigDecimal awardAmount) { this.awardAmount = awardAmount; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
}
