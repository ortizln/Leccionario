package com.leccionario.backend.studentmgmt;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "scholarship_types")
public class ScholarshipType extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "coverage_percent", precision = 5, scale = 2)
    private BigDecimal coveragePercent;

    @Column(name = "coverage_amount", precision = 10, scale = 2)
    private BigDecimal coverageAmount;

    @Column(columnDefinition = "TEXT")
    private String criteria;

    @Column(nullable = false)
    private Boolean active = true;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getCoveragePercent() { return coveragePercent; }
    public void setCoveragePercent(BigDecimal coveragePercent) { this.coveragePercent = coveragePercent; }
    public BigDecimal getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(BigDecimal coverageAmount) { this.coverageAmount = coverageAmount; }
    public String getCriteria() { return criteria; }
    public void setCriteria(String criteria) { this.criteria = criteria; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
