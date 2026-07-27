package com.leccionario.backend.audit.service;

import com.leccionario.backend.audit.domain.LogEntry;
import com.leccionario.backend.audit.domain.LogEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditServiceTest2 {

    private LogEntryRepository logEntryRepository;
    private AuditService service;

    @BeforeEach
    void setUp() {
        logEntryRepository = mock(LogEntryRepository.class);
        service = new AuditService(logEntryRepository);
    }

    @Test
    void log_savesEntry() {
        service.log("admin", "CREATE", "STUDENT", "Created student 1");
        verify(logEntryRepository).save(any(LogEntry.class));
    }

    @Test
    void findLogs_delegates() {
        LogEntry entry = new LogEntry();
        entry.setUsername("admin");
        entry.setModule("STUDENT");
        entry.setAction("CREATE");
        entry.setDetails("test");
        when(logEntryRepository.findAll(any(Sort.class))).thenReturn(List.of(entry));
        var results = service.findLogs("admin", "STUDENT");
        assertFalse(results.isEmpty());
    }

    @Test
    void findLogsPaginated_delegates() {
        Page<LogEntry> page = new PageImpl<>(List.of());
        when(logEntryRepository.findFiltered(any(), any(), any(Pageable.class))).thenReturn(page);
        var result = service.findLogsPaginated(null, null, 0, 10);
        assertNotNull(result);
    }

    @Test
    void getStats_returnsNonNull() {
        when(logEntryRepository.count()).thenReturn(5L);
        when(logEntryRepository.countByModule()).thenReturn(List.<Object[]>of(new Object[]{"STUDENT", 3L}));
        when(logEntryRepository.countByAction()).thenReturn(List.<Object[]>of(new Object[]{"CREATE", 3L}));
        when(logEntryRepository.countByUser()).thenReturn(List.<Object[]>of(new Object[]{"admin", 5L}));
        var stats = service.getStats();
        assertNotNull(stats);
    }
}
