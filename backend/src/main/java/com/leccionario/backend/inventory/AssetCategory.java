package com.leccionario.backend.inventory;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "asset_categories")
public class AssetCategory extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "depreciation_rate", precision = 5, scale = 2)
    private java.math.BigDecimal depreciationRate = java.math.BigDecimal.ZERO;

    @Column(name = "useful_life_years")
    private Integer usefulLifeYears;

    @Column(nullable = false)
    private Boolean active = true;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.math.BigDecimal getDepreciationRate() { return depreciationRate; }
    public void setDepreciationRate(java.math.BigDecimal depreciationRate) { this.depreciationRate = depreciationRate; }
    public Integer getUsefulLifeYears() { return usefulLifeYears; }
    public void setUsefulLifeYears(Integer usefulLifeYears) { this.usefulLifeYears = usefulLifeYears; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
