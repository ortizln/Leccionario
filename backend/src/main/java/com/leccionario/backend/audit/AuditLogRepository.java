package com.leccionario.backend.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    @Query("SELECT a.action, COUNT(a) FROM AuditLog a WHERE a.institutionId = ?1 GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<Object[]> countByAction(Long institutionId);

    @Query("SELECT a.entityType, COUNT(a) FROM AuditLog a WHERE a.institutionId = ?1 GROUP BY a.entityType ORDER BY COUNT(a) DESC")
    List<Object[]> countByEntityType(Long institutionId);
}
