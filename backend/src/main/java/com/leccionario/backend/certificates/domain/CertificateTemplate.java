package com.leccionario.backend.certificates.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import com.leccionario.backend.institution.domain.Institution;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "certificate_templates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"institution_id", "name"})
})
public class CertificateTemplate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "template_type", nullable = false, length = 30)
    private String templateType;

    @Column(length = 500)
    private String description;

    @Column(name = "header_text", columnDefinition = "text")
    private String headerText;

    @Column(name = "footer_text", columnDefinition = "text")
    private String footerText;

    @Column(name = "requires_grades", nullable = false)
    private Boolean requiresGrades = false;

    @Column(name = "requires_conduct", nullable = false)
    private Boolean requiresConduct = false;

    @Column(nullable = false)
    private Boolean active = true;
}
