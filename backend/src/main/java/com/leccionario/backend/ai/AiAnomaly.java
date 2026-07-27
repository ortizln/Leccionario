package com.leccionario.backend.ai;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_anomalies")
public class AiAnomaly extends BaseEntity {

    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "anomaly_type", nullable = false, length = 30)
    private String anomalyType;

    @Column(name = "entity_type", nullable = false, length = 20)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 10)
    private String severity = "MEDIA";

    @Column(name = "detected_value", length = 200)
    private String detectedValue;

    @Column(name = "expected_range", length = 200)
    private String expectedRange;

    @Column(nullable = false, length = 15)
    private String status = "DETECTADA";

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getAnomalyType() { return anomalyType; }
    public void setAnomalyType(String anomalyType) { this.anomalyType = anomalyType; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getDetectedValue() { return detectedValue; }
    public void setDetectedValue(String detectedValue) { this.detectedValue = detectedValue; }
    public String getExpectedRange() { return expectedRange; }
    public void setExpectedRange(String expectedRange) { this.expectedRange = expectedRange; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
