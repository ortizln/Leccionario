package com.leccionario.backend.studentmgmt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScholarshipServiceTest {

    private ScholarshipTypeRepository typeRepo;
    private ScholarshipApplicationRepository appRepo;
    private ScholarshipService service;

    @BeforeEach
    void setUp() {
        typeRepo = mock(ScholarshipTypeRepository.class);
        appRepo = mock(ScholarshipApplicationRepository.class);
        service = new ScholarshipService(typeRepo, appRepo);
    }

    @Test
    void createType_savesType() {
        ScholarshipType type = new ScholarshipType();
        type.setName("Beca Excelencia");
        when(typeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        ScholarshipType result = service.createType(type);
        assertEquals("Beca Excelencia", result.getName());
    }

    @Test
    void findTypes_delegatesToRepository() {
        when(typeRepo.findByInstitutionIdAndActiveTrueOrderByName(1L)).thenReturn(List.of());
        List<ScholarshipType> result = service.findTypes(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void approve_setsStatusAndAmount() {
        ScholarshipApplication app = new ScholarshipApplication();
        app.setId(1L);
        app.setStatus("PENDIENTE");
        when(appRepo.findById(1L)).thenReturn(Optional.of(app));
        when(appRepo.save(any())).thenReturn(app);
        ScholarshipApplication result = service.approve(1L, "admin", new BigDecimal("500.00"));
        assertEquals("APROBADA", app.getStatus());
        assertEquals("admin", app.getReviewedBy());
    }

    @Test
    void reject_setsStatusAndObservations() {
        ScholarshipApplication app = new ScholarshipApplication();
        app.setId(1L);
        app.setStatus("PENDIENTE");
        when(appRepo.findById(1L)).thenReturn(Optional.of(app));
        when(appRepo.save(any())).thenReturn(app);
        ScholarshipApplication result = service.reject(1L, "admin", "No cumple requisitos");
        assertEquals("RECHAZADA", app.getStatus());
        assertEquals("No cumple requisitos", app.getObservations());
    }

    @Test
    void getStats_returnsCounts() {
        when(typeRepo.findByInstitutionIdAndActiveTrueOrderByName(1L)).thenReturn(List.of(new ScholarshipType(), new ScholarshipType()));
        when(appRepo.findAll()).thenReturn(List.of());
        Map<String, Object> stats = service.getStats(1L);
        assertEquals(2, stats.get("types"));
        assertEquals(0L, stats.get("pending"));
    }
}
