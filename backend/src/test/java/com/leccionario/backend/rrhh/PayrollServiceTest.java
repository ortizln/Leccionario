package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PayrollServiceTest {

    private PayrollRepository payrollRepository;
    private PayrollEntryRepository entryRepository;
    private EmploymentContractRepository contractRepository;
    private PayrollService service;

    @BeforeEach
    void setUp() {
        payrollRepository = mock(PayrollRepository.class);
        entryRepository = mock(PayrollEntryRepository.class);
        contractRepository = mock(EmploymentContractRepository.class);
        service = new PayrollService(payrollRepository, entryRepository, contractRepository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(payrollRepository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        List<Payroll> result = service.findAll(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void create_savesPayroll() {
        Payroll p = new Payroll();
        p.setInstitutionId(1L);
        when(payrollRepository.save(any())).thenReturn(p);
        Payroll result = service.create(p);
        assertEquals(1L, result.getInstitutionId());
    }

    @Test
    void updateStatus_changesStatus() {
        Payroll p = new Payroll();
        p.setId(1L);
        p.setStatus("BORRADOR");
        when(payrollRepository.findById(1L)).thenReturn(Optional.of(p));
        when(payrollRepository.save(any())).thenReturn(p);
        Payroll result = service.updateStatus(1L, "APROBADO");
        assertEquals("APROBADO", result.getStatus());
    }

    @Test
    void addEntry_calculatesIessDeduction() {
        EmploymentContract contract = new EmploymentContract();
        contract.setSalary(new BigDecimal("1000.00"));
        when(contractRepository.findByEmployeeIdAndStatus(10L, "ACTIVO")).thenReturn(Optional.of(contract));
        when(entryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(payrollRepository.findById(1L)).thenReturn(Optional.of(new Payroll()));
        when(entryRepository.findByPayrollId(1L)).thenReturn(List.of());

        PayrollEntry entry = new PayrollEntry();
        entry.setPayrollId(1L);
        entry.setEmployeeId(10L);
        entry.setOvertimeAmount(BigDecimal.ZERO);
        entry.setBonusAmount(BigDecimal.ZERO);
        entry.setLoanDeduction(BigDecimal.ZERO);
        entry.setOtherDeductions(BigDecimal.ZERO);

        PayrollEntry result = service.addEntry(entry);
        assertNotNull(result.getGrossSalary());
        assertEquals(new BigDecimal("1000.00"), result.getGrossSalary());
        assertEquals(new BigDecimal("94.50"), result.getIessDeduction());
        assertEquals(new BigDecimal("905.50"), result.getNetSalary());
    }

    @Test
    void getPayrollStats_countsStatuses() {
        Payroll approved = new Payroll();
        approved.setStatus("APROBADO");
        Payroll pending = new Payroll();
        pending.setStatus("BORRADOR");
        Payroll paid = new Payroll();
        paid.setStatus("PAGADO");
        when(payrollRepository.findByInstitutionIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(approved, pending, paid));
        Map<String, Object> stats = service.getPayrollStats(1L);
        assertEquals(3, stats.get("total"));
        assertEquals(1L, stats.get("approved"));
        assertEquals(1L, stats.get("pending"));
    }
}
