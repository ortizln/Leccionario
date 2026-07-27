package com.leccionario.backend.finance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CashRegisterServiceTest {

    private CashRegisterRepository cashRegisterRepository;
    private CashTransactionRepository cashTransactionRepository;
    private CashRegisterService service;

    @BeforeEach
    void setUp() {
        cashRegisterRepository = mock(CashRegisterRepository.class);
        cashTransactionRepository = mock(CashTransactionRepository.class);
        service = new CashRegisterService(cashRegisterRepository, cashTransactionRepository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(cashRegisterRepository.findByInstitutionIdOrderByRegisterDateDesc(1L)).thenReturn(List.of());
        List<CashRegisterResponse> result = service.findAll(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void open_createsCashRegister() {
        when(cashRegisterRepository.findByInstitutionIdAndRegisterDateAndStatus(eq(1L), any(), eq("ABIERTA"))).thenReturn(null);
        when(cashRegisterRepository.save(any())).thenAnswer(inv -> {
            CashRegister cr = inv.getArgument(0);
            cr.setId(1L);
            return cr;
        });
        CashRegisterRequest req = new CashRegisterRequest();
        req.institutionId = 1L;
        req.openingBalance = new BigDecimal("100.00");
        CashRegisterResponse result = service.open(req);
        assertEquals("ABIERTA", result.status);
    }

    @Test
    void open_throwsWhenAlreadyOpen() {
        CashRegister existing = new CashRegister();
        existing.setStatus("ABIERTA");
        when(cashRegisterRepository.findByInstitutionIdAndRegisterDateAndStatus(eq(1L), any(), eq("ABIERTA"))).thenReturn(existing);
        CashRegisterRequest req = new CashRegisterRequest();
        req.institutionId = 1L;
        assertThrows(RuntimeException.class, () -> service.open(req));
    }

    @Test
    void addTransaction_savesAndReturns() {
        CashRegister cr = new CashRegister();
        cr.setId(1L);
        cr.setStatus("ABIERTA");
        when(cashRegisterRepository.findById(1L)).thenReturn(Optional.of(cr));
        when(cashTransactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        CashTransactionRequest req = new CashTransactionRequest();
        req.registerId = 1L;
        req.transactionType = "INGRESO";
        req.amount = new BigDecimal("50.00");
        CashTransactionResponse result = service.addTransaction(req);
        assertEquals("INGRESO", result.transactionType);
    }

    @Test
    void addTransaction_throwsWhenClosed() {
        CashRegister cr = new CashRegister();
        cr.setId(1L);
        cr.setStatus("CERRADA");
        when(cashRegisterRepository.findById(1L)).thenReturn(Optional.of(cr));
        CashTransactionRequest req = new CashTransactionRequest();
        req.registerId = 1L;
        assertThrows(RuntimeException.class, () -> service.addTransaction(req));
    }
}
