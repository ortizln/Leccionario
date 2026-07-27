package com.leccionario.backend.enrollment;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "period_id"}))
public class Enrollment extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "period_id", nullable = false)
    private Long periodId;

    @Column(name = "enrollment_number", nullable = false, length = 20)
    private String enrollmentNumber;

    @Column(name = "parallel_code", length = 5)
    private String parallelCode;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVE";

    @Column(name = "enrollment_date", nullable = false)
    private java.time.LocalDate enrollmentDate = java.time.LocalDate.now();

    @Column(name = "withdrawal_date")
    private java.time.LocalDate withdrawalDate;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }
    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }
    public String getParallelCode() { return parallelCode; }
    public void setParallelCode(String parallelCode) { this.parallelCode = parallelCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.time.LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(java.time.LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public java.time.LocalDate getWithdrawalDate() { return withdrawalDate; }
    public void setWithdrawalDate(java.time.LocalDate withdrawalDate) { this.withdrawalDate = withdrawalDate; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
