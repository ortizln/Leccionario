package com.leccionario.backend.audit;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user", columnList = "userId"),
    @Index(name = "idx_audit_entity", columnList = "entityType, entityId"),
    @Index(name = "idx_audit_created", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {
    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false, length = 100)
    private String entityType;

    private Long entityId;

    @Column(length = 100)
    private String entityName;

    private Long userId;

    @Column(length = 100)
    private String username;

    private Long institutionId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(columnDefinition = "TEXT")
    private String oldValues;

    @Column(columnDefinition = "TEXT")
    private String newValues;

    @Column(nullable = false, length = 50)
    private String status = "EXITOSO";

    @Column(length = 50)
    private String ipAddress;
}
