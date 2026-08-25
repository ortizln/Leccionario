package com.leccionario.backend.audit.web;

import com.leccionario.backend.audit.AuditLog;
import com.leccionario.backend.audit.AuditLogRepository;
import com.leccionario.backend.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogRepository repository;
    private final UserRepository userRepository;

    public AuditController(AuditLogRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private Long resolveInstitutionId(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(u -> u.getInstitution() != null ? u.getInstitution().getId() : 1L)
                .orElse(1L);
    }

    @GetMapping
    public ResponseEntity<Page<AuditLog>> findAll(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(repository.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<AuditLog>> findPaginated(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(repository.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<?> getEntityAudit(@PathVariable String entityType, @PathVariable Long entityId) {
        return ResponseEntity.ok(repository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Principal principal) {
        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("byAction", repository.countByAction(1L));
        stats.put("byEntity", repository.countByEntityType(1L));
        stats.put("totalLogs", repository.count());
        return ResponseEntity.ok(stats);
    }
}
