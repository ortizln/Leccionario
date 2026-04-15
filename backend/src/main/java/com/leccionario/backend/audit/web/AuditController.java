package com.leccionario.backend.audit.web;

import com.leccionario.backend.audit.dto.AuditLogResponse;
import com.leccionario.backend.audit.service.AuditService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public ResponseEntity<List<AuditLogResponse>> findLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String module) {
        return ResponseEntity.ok(auditService.findLogs(username, module));
    }
}
