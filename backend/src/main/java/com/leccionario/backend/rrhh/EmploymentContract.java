package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employment_contracts")
public class EmploymentContract extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "contract_number", nullable = false, length = 30)
    private String contractNumber;

    @Column(name = "contract_type", nullable = false, length = 20)
    private String contractType = "INDEFINIDO";

    @Column(nullable = false, length = 150)
    private String position;

    @Column(length = 100)
    private String department;

    @Column(precision = 10, scale = 2)
    private BigDecimal salary;

    @Column(name = "salary_type", nullable = false, length = 15)
    private String salaryType = "MENSUAL";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "trial_period_days")
    private Integer trialPeriodDays = 90;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVO";

    @Column(name = "termination_reason", columnDefinition = "TEXT")
    private String terminationReason;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }
    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
    public String getSalaryType() { return salaryType; }
    public void setSalaryType(String salaryType) { this.salaryType = salaryType; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getTrialPeriodDays() { return trialPeriodDays; }
    public void setTrialPeriodDays(Integer trialPeriodDays) { this.trialPeriodDays = trialPeriodDays; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTerminationReason() { return terminationReason; }
    public void setTerminationReason(String terminationReason) { this.terminationReason = terminationReason; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
