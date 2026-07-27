package com.leccionario.backend.studentmgmt;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "clubs")
public class Club extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "club_type", nullable = false, length = 20)
    private String clubType = "DEPORTIVO";

    @Column(length = 200)
    private String coordinator;

    @Column(name = "schedule_info", columnDefinition = "TEXT")
    private String scheduleInfo;

    @Column(name = "max_members")
    private Integer maxMembers;

    @Column(nullable = false)
    private Boolean active = true;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getClubType() { return clubType; }
    public void setClubType(String clubType) { this.clubType = clubType; }
    public String getCoordinator() { return coordinator; }
    public void setCoordinator(String coordinator) { this.coordinator = coordinator; }
    public String getScheduleInfo() { return scheduleInfo; }
    public void setScheduleInfo(String scheduleInfo) { this.scheduleInfo = scheduleInfo; }
    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
