package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private EmploymentContractRepository contractRepository;

    @InjectMocks
    private ContractService contractService;

    @Test
    void create_setsCreatedByAndSaves() {
        EmploymentContract contract = new EmploymentContract();
        contract.setContractNumber("C-001");

        when(contractRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmploymentContract saved = contractService.create(contract, "admin");

        assertEquals("admin", saved.getCreatedBy());
        verify(contractRepository).save(contract);
    }

    @Test
    void update_throwsWhenNotFound() {
        when(contractRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> contractService.update(999L, new EmploymentContract()));
    }

    @Test
    void update_copiesFields() {
        EmploymentContract existing = new EmploymentContract();
        existing.setContractNumber("OLD-001");
        existing.setPosition("Old Position");

        EmploymentContract updates = new EmploymentContract();
        updates.setContractNumber("NEW-001");
        updates.setContractType("TEMPORAL");
        updates.setPosition("New Position");
        updates.setDepartment("IT");
        updates.setSalary(new BigDecimal("1200"));
        updates.setSalaryType("MENSUAL");
        updates.setStartDate(LocalDate.of(2026, 1, 1));
        updates.setEndDate(LocalDate.of(2026, 12, 31));
        updates.setTrialPeriodDays(30);
        updates.setStatus("ACTIVO");
        updates.setTerminationReason(null);

        when(contractRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(contractRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmploymentContract result = contractService.update(1L, updates);

        assertEquals("NEW-001", result.getContractNumber());
        assertEquals("TEMPORAL", result.getContractType());
        assertEquals("New Position", result.getPosition());
        assertEquals("IT", result.getDepartment());
        assertEquals(new BigDecimal("1200"), result.getSalary());
        assertEquals("MENSUAL", result.getSalaryType());
        assertEquals(LocalDate.of(2026, 1, 1), result.getStartDate());
        assertEquals(LocalDate.of(2026, 12, 31), result.getEndDate());
        assertEquals(30, result.getTrialPeriodDays());
        assertEquals("ACTIVO", result.getStatus());
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(contractRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> contractService.findById(999L));
    }

    @Test
    void findActiveByEmployee_throwsWhenNoneActive() {
        when(contractRepository.findByEmployeeIdAndStatus(1L, "ACTIVO")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> contractService.findActiveByEmployee(1L));
    }

    @Test
    void findActiveByEmployee_returnsWhenActive() {
        EmploymentContract active = new EmploymentContract();
        active.setStatus("ACTIVO");

        when(contractRepository.findByEmployeeIdAndStatus(1L, "ACTIVO")).thenReturn(Optional.of(active));

        EmploymentContract result = contractService.findActiveByEmployee(1L);

        assertEquals("ACTIVO", result.getStatus());
    }
}
