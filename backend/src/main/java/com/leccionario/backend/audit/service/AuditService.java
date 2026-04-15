package com.leccionario.backend.audit.service;

import com.leccionario.backend.audit.domain.AuditLog;
import com.leccionario.backend.audit.dto.AuditLogResponse;
import com.leccionario.backend.audit.repository.AuditLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String username, String action, String module, String details) {
        AuditLog logEntry = new AuditLog();
        logEntry.setUsername(username);
        logEntry.setAction(action);
        logEntry.setModule(module);
        logEntry.setDetails(details);
        auditLogRepository.save(logEntry);
        log.info("AUDIT [{}] {} - {}", module, action, username);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findLogs(String username, String module) {
        String usernameFilter = username == null ? "" : username.trim().toLowerCase();
        String moduleFilter = module == null ? "" : module.trim().toLowerCase();

        return auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .filter(logEntry -> usernameFilter.isBlank()
                        || logEntry.getUsername().toLowerCase().contains(usernameFilter))
                .filter(logEntry -> moduleFilter.isBlank()
                        || logEntry.getModule().toLowerCase().contains(moduleFilter))
                .map(logEntry -> new AuditLogResponse(
                        logEntry.getId(),
                        logEntry.getUsername(),
                        logEntry.getAction(),
                        logEntry.getModule(),
                        logEntry.getDetails(),
                        logEntry.getCreatedAt()))
                .toList();
    }
}
