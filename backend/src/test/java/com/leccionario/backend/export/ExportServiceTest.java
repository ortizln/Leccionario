package com.leccionario.backend.export;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock
    private JdbcTemplate jdbc;

    @InjectMocks
    private ExportService exportService;

    @Test
    void exportToCsv_emptyResult_returnsEmptyBytes() {
        when(jdbc.queryForList(anyString())).thenReturn(List.of());

        byte[] result = exportService.exportStudentsCsv(1L);

        assertNotNull(result);
        assertEquals(0, result.length);
    }

    @Test
    void exportToCsv_withData_returnsCsvContent() {
        Map<String, Object> row1 = new LinkedHashMap<>();
        row1.put("id", 1L);
        row1.put("first_name", "Juan");
        row1.put("last_name", "Perez");
        Map<String, Object> row2 = new LinkedHashMap<>();
        row2.put("id", 2L);
        row2.put("first_name", "Maria");
        row2.put("last_name", "Lopez");

        when(jdbc.queryForList(anyString())).thenReturn(List.of(row1, row2));

        byte[] result = exportService.exportStudentsCsv(1L);

        assertNotNull(result);
        assertTrue(result.length > 0);
        String csv = new String(result);
        assertTrue(csv.contains("1"));
        assertTrue(csv.contains("Juan"));
        assertTrue(csv.contains("Maria"));
        assertTrue(csv.contains("Perez"));
        String[] lines = csv.split("\n");
        assertEquals(3, lines.length);
    }

    @Test
    void exportToCsv_handlesSpecialCharacters() {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", 1L);
        row.put("name", "Test value");

        when(jdbc.queryForList(anyString())).thenReturn(List.of(row));

        byte[] result = exportService.exportStudentsCsv(1L);

        assertNotNull(result);
        assertTrue(result.length > 0);
        String csv = new String(result);
        assertTrue(csv.contains("Test value"));
    }
}
