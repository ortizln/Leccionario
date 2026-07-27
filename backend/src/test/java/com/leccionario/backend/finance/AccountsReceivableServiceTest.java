package com.leccionario.backend.finance;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountsReceivableServiceTest {

    @Mock
    private AccountsReceivableRepository accountsReceivableRepository;

    @InjectMocks
    private AccountsReceivableService accountsReceivableService;

    @Test
    void create_setsFieldsAndSaves() {
        when(accountsReceivableRepository.save(any())).thenAnswer(inv -> {
            AccountsReceivable ar = inv.getArgument(0);
            ar.setId(1L);
            return ar;
        });

        AccountsReceivableResponse resp = accountsReceivableService.create(
            1L, 10L, 5L, "Pension Enero", new BigDecimal("150.00")
        );

        assertEquals(1L, resp.institutionId);
        assertEquals(10L, resp.studentId);
        assertEquals(5L, resp.invoiceId);
        assertEquals("Pension Enero", resp.description);
        assertEquals(new BigDecimal("150.00"), resp.originalAmount);
        assertEquals("PENDIENTE", resp.status);
        assertEquals(BigDecimal.ZERO, resp.paidAmount);
    }

    @Test
    void addPayment_throwsWhenNotFound() {
        when(accountsReceivableRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
            accountsReceivableService.addPayment(999L, new BigDecimal("50"))
        );
    }

    @Test
    void addPayment_setsParcial_whenPartialPayment() {
        AccountsReceivable ar = new AccountsReceivable();
        ar.setId(1L);
        ar.setOriginalAmount(new BigDecimal("100"));
        ar.setPaidAmount(new BigDecimal("0"));
        ar.setStatus("PENDIENTE");

        when(accountsReceivableRepository.findById(1L)).thenReturn(Optional.of(ar));
        when(accountsReceivableRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AccountsReceivableResponse resp = accountsReceivableService.addPayment(1L, new BigDecimal("50"));

        assertEquals("PARCIAL", resp.status);
        assertEquals(new BigDecimal("50"), resp.paidAmount);
    }

    @Test
    void addPayment_setsPagado_whenFullyPaid() {
        AccountsReceivable ar = new AccountsReceivable();
        ar.setId(1L);
        ar.setOriginalAmount(new BigDecimal("100"));
        ar.setPaidAmount(new BigDecimal("80"));
        ar.setStatus("PARCIAL");

        when(accountsReceivableRepository.findById(1L)).thenReturn(Optional.of(ar));
        when(accountsReceivableRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AccountsReceivableResponse resp = accountsReceivableService.addPayment(1L, new BigDecimal("20"));

        assertEquals("PAGADO", resp.status);
        assertEquals(new BigDecimal("100"), resp.paidAmount);
    }

    @Test
    void addPayment_setsPagado_whenOverpaid() {
        AccountsReceivable ar = new AccountsReceivable();
        ar.setId(1L);
        ar.setOriginalAmount(new BigDecimal("100"));
        ar.setPaidAmount(new BigDecimal("90"));
        ar.setStatus("PARCIAL");

        when(accountsReceivableRepository.findById(1L)).thenReturn(Optional.of(ar));
        when(accountsReceivableRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AccountsReceivableResponse resp = accountsReceivableService.addPayment(1L, new BigDecimal("20"));

        assertEquals("PAGADO", resp.status);
        assertEquals(new BigDecimal("110"), resp.paidAmount);
    }
}
