package com.leccionario.backend.audit;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository repository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void log_savesAuditLog() throws Exception {
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        auditLogService.log("CREAR", "STUDENT", 1L, "Juan Perez", 10L, "admin", 1L,
            "Created student", null, Map.of("name", "Juan"));

        verify(repository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logCreate_savesWithCorrectAction() throws Exception {
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        auditLogService.logCreate("STUDENT", 1L, "Juan", 10L, "admin", 1L, Map.of("name", "Juan"));

        verify(repository, times(1)).save(argThat(log ->
            "CREAR".equals(log.getAction()) && "STUDENT".equals(log.getEntityType())
        ));
    }

    @Test
    void logDelete_savesWithCorrectAction() {
        auditLogService.logDelete("STUDENT", 1L, "Juan", 10L, "admin", 1L);

        verify(repository, times(1)).save(argThat(log ->
            "ELIMINAR".equals(log.getAction()) && "STUDENT".equals(log.getEntityType())
        ));
    }

    @Test
    void log_exceptionDoesNotPropagate() {
        when(repository.save(any())).thenThrow(new RuntimeException("DB error"));

        assertDoesNotThrow(() ->
            auditLogService.log("CREAR", "STUDENT", 1L, null, 10L, "admin", 1L, null, null, null)
        );
    }
}
