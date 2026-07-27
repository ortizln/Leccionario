package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VacationServiceTest {

    private VacationPeriodRepository periodRepository;
    private VacationRequestRepository requestRepository;
    private StaffPermissionRepository permissionRepository;
    private VacationService service;

    @BeforeEach
    void setUp() {
        periodRepository = mock(VacationPeriodRepository.class);
        requestRepository = mock(VacationRequestRepository.class);
        permissionRepository = mock(StaffPermissionRepository.class);
        service = new VacationService(periodRepository, requestRepository, permissionRepository);
    }

    @Test
    void getOrCreatePeriod_existing_returnsExisting() {
        VacationPeriod existing = new VacationPeriod();
        existing.setId(1L);
        existing.setYear(2024);
        when(periodRepository.findByEmployeeIdAndYear(1L, 2024)).thenReturn(Optional.of(existing));
        VacationPeriod result = service.getOrCreatePeriod(1L, 2024);
        assertEquals(1L, result.getId());
        verify(periodRepository, never()).save(any());
    }

    @Test
    void getOrCreatePeriod_notExisting_createsNew() {
        when(periodRepository.findByEmployeeIdAndYear(1L, 2024)).thenReturn(Optional.empty());
        VacationPeriod saved = new VacationPeriod();
        saved.setId(2L);
        when(periodRepository.save(any())).thenReturn(saved);

        VacationPeriod result = service.getOrCreatePeriod(1L, 2024);
        assertEquals(2L, result.getId());
        assertEquals(15, result.getTotalDays());
    }

    @Test
    void approveRequest_setsStatusAndDate() {
        VacationRequest req = new VacationRequest();
        req.setId(1L);
        req.setStatus("PENDIENTE");
        when(requestRepository.findById(1L)).thenReturn(Optional.of(req));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VacationRequest result = service.approveRequest(1L, "admin");
        assertEquals("APROBADA", result.getStatus());
        assertEquals("admin", result.getApprovedBy());
    }

    @Test
    void approveRequest_notFound_throws() {
        when(requestRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.approveRequest(1L, "admin"));
    }

    @Test
    void rejectRequest_revertsUsedDays() {
        VacationRequest req = new VacationRequest();
        req.setId(1L);
        req.setStatus("PENDIENTE");
        req.setDaysRequested(5);
        req.setPeriodId(10L);
        when(requestRepository.findById(1L)).thenReturn(Optional.of(req));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VacationPeriod period = new VacationPeriod();
        period.setId(10L);
        period.setUsedDays(10);
        when(periodRepository.findById(10L)).thenReturn(Optional.of(period));
        when(periodRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VacationRequest result = service.rejectRequest(1L, "admin");
        assertEquals("RECHAZADA", result.getStatus());
        assertEquals(5, period.getUsedDays());
    }

    @Test
    void createPermission_savesAndReturns() {
        StaffPermission perm = new StaffPermission();
        when(permissionRepository.save(perm)).thenReturn(perm);
        assertNotNull(service.createPermission(perm));
    }

    @Test
    void approvePermission_setsStatus() {
        StaffPermission p = new StaffPermission();
        p.setId(1L);
        when(permissionRepository.findById(1L)).thenReturn(Optional.of(p));
        when(permissionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        StaffPermission result = service.approvePermission(1L, "admin");
        assertEquals("APROBADO", result.getStatus());
    }

    @Test
    void findPending_delegatesToRepository() {
        when(requestRepository.findByStatusOrderByStartDateDesc("PENDIENTE")).thenReturn(List.of());
        assertTrue(service.findPending().isEmpty());
    }

    @Test
    void findPendingPermissions_delegatesToRepository() {
        when(permissionRepository.findByStatusOrderByStartDateDesc("PENDIENTE")).thenReturn(List.of());
        assertTrue(service.findPendingPermissions().isEmpty());
    }
}
