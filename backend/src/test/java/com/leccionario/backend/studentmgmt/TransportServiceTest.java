package com.leccionario.backend.studentmgmt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransportServiceTest {

    private TransportRouteRepository routeRepo;
    private TransportAssignmentRepository assignmentRepo;
    private TransportService service;

    @BeforeEach
    void setUp() {
        routeRepo = mock(TransportRouteRepository.class);
        assignmentRepo = mock(TransportAssignmentRepository.class);
        service = new TransportService(routeRepo, assignmentRepo);
    }

    @Test
    void createRoute_savesRoute() {
        TransportRoute route = new TransportRoute();
        route.setRouteName("Ruta Norte");
        when(routeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        TransportRoute result = service.createRoute(route);
        assertEquals("Ruta Norte", result.getRouteName());
    }

    @Test
    void findRoutes_delegatesToRepository() {
        when(routeRepo.findByInstitutionIdAndStatusOrderByName(1L, "ACTIVA")).thenReturn(List.of());
        List<TransportRoute> result = service.findRoutes(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void update_modifiesRoute() {
        TransportRoute existing = new TransportRoute();
        existing.setId(1L);
        existing.setRouteName("Old");
        TransportRoute updates = new TransportRoute();
        updates.setRouteName("New");
        updates.setCapacity(40);
        when(routeRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(routeRepo.save(any())).thenReturn(existing);
        TransportRoute result = service.updateRoute(1L, updates);
        assertEquals("New", result.getRouteName());
        assertEquals(40, result.getCapacity());
    }

    @Test
    void getRouteStats_returnsAssignedAndCapacity() {
        TransportRoute route = new TransportRoute();
        route.setCapacity(40);
        when(assignmentRepo.countByRouteIdAndStatus(1L, "ACTIVO")).thenReturn(25L);
        when(routeRepo.findById(1L)).thenReturn(Optional.of(route));
        Map<String, Object> stats = service.getRouteStats(1L);
        assertEquals(25L, stats.get("assigned"));
        assertEquals(40, stats.get("capacity"));
    }

    @Test
    void getInstitutionStats_returnsSummary() {
        TransportRoute r1 = new TransportRoute();
        r1.setStatus("ACTIVA");
        TransportRoute r2 = new TransportRoute();
        r2.setStatus("INACTIVA");
        when(routeRepo.findByInstitutionIdOrderByNameAsc(1L)).thenReturn(List.of(r1, r2));
        when(assignmentRepo.countByStatus("ACTIVO")).thenReturn(30L);
        Map<String, Object> stats = service.getInstitutionStats(1L);
        assertEquals(2L, stats.get("totalRoutes"));
        assertEquals(1L, stats.get("activeRoutes"));
        assertEquals(30L, stats.get("totalAssigned"));
    }
}
