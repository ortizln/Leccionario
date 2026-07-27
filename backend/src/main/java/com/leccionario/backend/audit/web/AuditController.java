package com.leccionario.backend.audit.web;

import com.leccionario.backend.audit.AuditLog;
import com.leccionario.backend.audit.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
@Tag(name = "Auditoría")
public class AuditController {

    private final AuditLogRepository repository;

    public AuditController(AuditLogRepository repository) { this.repository = repository; }

    @Operation(summary = "Listar registros de auditoría")
    @GetMapping
    public ResponseEntity<Page<AuditLog>> findAll(@RequestParam Long institutionId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(repository.findByInstitutionIdOrderByCreatedAtDesc(institutionId)
            .isEmpty() ? Page.empty() : repository.findAll(PageRequest.of(page, size)));
    }

    @Operation(summary = "Obtener auditoría de una entidad específica")
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<?> getEntityAudit(@PathVariable String entityType, @PathVariable Long entityId) {
        return ResponseEntity.ok(repository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId));
    }

    @Operation(summary = "Estadísticas de auditoría")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam Long institutionId) {
        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("byAction", repository.countByAction(institutionId));
        stats.put("byEntity", repository.countByEntityType(institutionId));
        stats.put("totalLogs", repository.count());
        return ResponseEntity.ok(stats);
    }
}
