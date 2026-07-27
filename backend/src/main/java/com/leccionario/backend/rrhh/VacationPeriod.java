package com.leccionario.backend.rrhh;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "vacation_periods")
public class VacationPeriod extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays = 15;

    @Column(name = "used_days", nullable = false)
    private Integer usedDays = 0;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }
    public Integer getUsedDays() { return usedDays; }
    public void setUsedDays(Integer usedDays) { this.usedDays = usedDays; }
}
