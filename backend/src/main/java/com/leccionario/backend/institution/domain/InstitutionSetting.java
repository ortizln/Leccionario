package com.leccionario.backend.institution.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "institution_settings")
public class InstitutionSetting extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "setting_key", nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(name = "setting_type", nullable = false, length = 15)
    private String settingType = "STRING";

    @Column(length = 50)
    private String category;

    @Column(length = 300)
    private String description;
}
