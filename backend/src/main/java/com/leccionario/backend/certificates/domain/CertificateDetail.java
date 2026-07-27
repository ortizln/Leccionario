package com.leccionario.backend.certificates.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "certificate_details")
public class CertificateDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "certificate_id", nullable = false)
    private Certificate certificate;

    @Column(name = "subject_name", length = 150)
    private String subjectName;

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(length = 20)
    private String status;

    @Column(length = 300)
    private String observation;
}
