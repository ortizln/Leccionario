package com.leccionario.backend.communication;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "communication_groups")
public class CommunicationGroup extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "group_type", nullable = false, length = 20)
    private String groupType = "PERSONALIZADO";

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGroupType() { return groupType; }
    public void setGroupType(String groupType) { this.groupType = groupType; }
}
