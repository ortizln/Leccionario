package com.leccionario.backend.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private final AuditLogRepository repository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void log(String action, String entityType, Long entityId, String entityName,
                    Long userId, String username, Long institutionId,
                    String details, Object oldValues, Object newValues) {
        try {
            AuditLog entry = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .userId(userId)
                .username(username)
                .institutionId(institutionId)
                .details(details)
                .oldValues(oldValues != null ? objectMapper.writeValueAsString(oldValues) : null)
                .newValues(newValues != null ? objectMapper.writeValueAsString(newValues) : null)
                .status("EXITOSO")
                .build();
            repository.save(entry);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    @Transactional
    public void logCreate(String entityType, Long entityId, String entityName,
                          Long userId, String username, Long institutionId, Object entity) {
        log("CREAR", entityType, entityId, entityName, userId, username, institutionId,
            "Created " + entityType, null, entity);
    }

    @Transactional
    public void logUpdate(String entityType, Long entityId, String entityName,
                          Long userId, String username, Long institutionId, Object oldEntity, Object newEntity) {
        log("ACTUALIZAR", entityType, entityId, entityName, userId, username, institutionId,
            "Updated " + entityType, oldEntity, newEntity);
    }

    @Transactional
    public void logDelete(String entityType, Long entityId, String entityName,
                          Long userId, String username, Long institutionId) {
        log("ELIMINAR", entityType, entityId, entityName, userId, username, institutionId,
            "Deleted " + entityType, null, null);
    }

    @Transactional
    public void logView(String entityType, Long entityId, String entityName,
                        Long userId, String username, Long institutionId) {
        log("CONSULTAR", entityType, entityId, entityName, userId, username, institutionId,
            "Viewed " + entityType, null, null);
    }
}
