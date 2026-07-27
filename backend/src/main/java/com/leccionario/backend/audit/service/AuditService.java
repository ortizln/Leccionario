package com.leccionario.backend.audit.service;

import com.leccionario.backend.audit.domain.LogEntry;
import com.leccionario.backend.audit.domain.LogEntryRepository;
import com.leccionario.backend.audit.dto.AuditLogResponse;
import com.leccionario.backend.audit.dto.AuditStatsResponse;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final LogEntryRepository logEntryRepository;

    public void log(String username, String action, String module, String details) {
        LogEntry logEntry = new LogEntry();
        logEntry.setUsername(username);
        logEntry.setAction(action);
        logEntry.setModule(module);
        logEntry.setDetails(details);
        logEntryRepository.save(logEntry);
        log.info("AUDIT [{}] {} - {}", module, action, username);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> findLogs(String username, String module) {
        String usernameFilter = username == null ? "" : username.trim().toLowerCase();
        String moduleFilter = module == null ? "" : module.trim().toLowerCase();

        return logEntryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
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

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> findLogsPaginated(String username, String module, int page, int size) {
        Page<LogEntry> result = logEntryRepository.findFiltered(
                username != null ? username.trim() : "",
                module != null ? module.trim() : "",
                PageRequest.of(page, size));

        return result.map(logEntry -> new AuditLogResponse(
                logEntry.getId(),
                logEntry.getUsername(),
                logEntry.getAction(),
                logEntry.getModule(),
                logEntry.getDetails(),
                logEntry.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public AuditStatsResponse getStats() {
        long total = logEntryRepository.count();

        List<Object[]> byModule = logEntryRepository.countByModule();
        Map<String, Long> moduleCounts = new LinkedHashMap<>();
        for (Object[] row : byModule) {
            moduleCounts.put((String) row[0], ((Number) row[1]).longValue());
        }

        List<Object[]> byAction = logEntryRepository.countByAction();
        Map<String, Long> actionCounts = new LinkedHashMap<>();
        for (Object[] row : byAction) {
            actionCounts.put((String) row[0], ((Number) row[1]).longValue());
        }

        List<Object[]> byUser = logEntryRepository.countByUser();
        Map<String, Long> userCounts = new LinkedHashMap<>();
        for (Object[] row : byUser) {
            userCounts.put((String) row[0], ((Number) row[1]).longValue());
        }

        return new AuditStatsResponse(total, moduleCounts, actionCounts, userCounts);
    }
}
