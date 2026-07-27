package com.leccionario.backend.audit.domain;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "logs")
public class LogEntry extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String username;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String module;

    @Column(length = 1500)
    private String details;
}
