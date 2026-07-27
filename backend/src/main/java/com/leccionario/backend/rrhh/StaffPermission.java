package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "staff_permissions")
public class StaffPermission extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "permission_type", nullable = false, length = 25)
    private String permissionType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "hours_requested")
    private BigDecimal hoursRequested;

    @Column(name = "days_requested")
    private Integer daysRequested;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "medical_certificate")
    private Boolean medicalCertificate = false;

    @Column(nullable = false, length = 15)
    private String status = "PENDIENTE";

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getPermissionType() { return permissionType; }
    public void setPermissionType(String permissionType) { this.permissionType = permissionType; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public BigDecimal getHoursRequested() { return hoursRequested; }
    public void setHoursRequested(BigDecimal hoursRequested) { this.hoursRequested = hoursRequested; }
    public Integer getDaysRequested() { return daysRequested; }
    public void setDaysRequested(Integer daysRequested) { this.daysRequested = daysRequested; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Boolean getMedicalCertificate() { return medicalCertificate; }
    public void setMedicalCertificate(Boolean medicalCertificate) { this.medicalCertificate = medicalCertificate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public LocalDate getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDate approvalDate) { this.approvalDate = approvalDate; }
}
