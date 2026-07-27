package com.leccionario.backend.ai;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_recommendations")
public class AiRecommendation extends BaseEntity {

    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 10)
    private String priority = "NORMAL";

    @Column(nullable = false, length = 15)
    private String status = "PENDIENTE";

    @Column(name = "applied_at")
    private Instant appliedAt;

    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }
}
