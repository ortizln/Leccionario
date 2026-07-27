package com.leccionario.backend.ai;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ai_models")
public class AiModel extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "model_type", nullable = false, length = 30)
    private String modelType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String version = "1.0";

    @Column(columnDefinition = "jsonb")
    private String config;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVO";

    @Column(name = "last_trained_at")
    private Instant lastTrainedAt;

    @Column(precision = 5, scale = 4)
    private BigDecimal accuracy;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getModelType() { return modelType; }
    public void setModelType(String modelType) { this.modelType = modelType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getConfig() { return config; }
    public void setConfig(String config) { this.config = config; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getLastTrainedAt() { return lastTrainedAt; }
    public void setLastTrainedAt(Instant lastTrainedAt) { this.lastTrainedAt = lastTrainedAt; }
    public BigDecimal getAccuracy() { return accuracy; }
    public void setAccuracy(BigDecimal accuracy) { this.accuracy = accuracy; }
}
