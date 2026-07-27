package com.leccionario.backend.institution.service;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class SenescytServiceTest {

    private final SenescytService senescytService = new SenescytService();

    @Test
    void validateTeacherCredentials_returnsValidData() {
        Map<String, Object> result = senescytService.validateTeacherCredentials("1712345678");

        assertNotNull(result);
        assertEquals("1712345678", result.get("cedula"));
        assertEquals(true, result.get("valid"));
        assertNotNull(result.get("title"));
        assertNotNull(result.get("senescytNumber"));
        assertEquals("VIGENTE", result.get("status"));
    }

    @Test
    void validateInstitutionData_returnsValidData() {
        Map<String, Object> result = senescytService.validateInstitutionData("1790000000001");

        assertNotNull(result);
        assertEquals("1790000000001", result.get("ruc"));
        assertEquals(true, result.get("valid"));
        assertNotNull(result.get("authorizationNumber"));
        assertEquals("AUTORIZADA", result.get("status"));
    }
}
