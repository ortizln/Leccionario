package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll_entries")
public class PayrollEntry extends BaseEntity {

    @Column(name = "payroll_id", nullable = false)
    private Long payrollId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "base_salary", precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "overtime_hours", precision = 5, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "overtime_amount", precision = 12, scale = 2)
    private BigDecimal overtimeAmount = BigDecimal.ZERO;

    @Column(name = "bonus_amount", precision = 12, scale = 2)
    private BigDecimal bonusAmount = BigDecimal.ZERO;

    @Column(name = "gross_salary", precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "iess_deduction", precision = 12, scale = 2)
    private BigDecimal iessDeduction = BigDecimal.ZERO;

    @Column(name = "loan_deduction", precision = 12, scale = 2)
    private BigDecimal loanDeduction = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 12, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_salary", precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(length = 100)
    private String notes;

    public Long getPayrollId() { return payrollId; }
    public void setPayrollId(Long payrollId) { this.payrollId = payrollId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }
    public BigDecimal getOvertimeAmount() { return overtimeAmount; }
    public void setOvertimeAmount(BigDecimal overtimeAmount) { this.overtimeAmount = overtimeAmount; }
    public BigDecimal getBonusAmount() { return bonusAmount; }
    public void setBonusAmount(BigDecimal bonusAmount) { this.bonusAmount = bonusAmount; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }
    public BigDecimal getIessDeduction() { return iessDeduction; }
    public void setIessDeduction(BigDecimal iessDeduction) { this.iessDeduction = iessDeduction; }
    public BigDecimal getLoanDeduction() { return loanDeduction; }
    public void setLoanDeduction(BigDecimal loanDeduction) { this.loanDeduction = loanDeduction; }
    public BigDecimal getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(BigDecimal otherDeductions) { this.otherDeductions = otherDeductions; }
    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }
    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
