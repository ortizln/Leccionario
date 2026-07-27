package com.leccionario.backend.finance;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CreditNoteServiceTest {

    private CreditNoteRepository creditNoteRepository;
    private InvoiceRepository invoiceRepository;
    private CreditNoteService service;

    @BeforeEach
    void setUp() {
        creditNoteRepository = mock(CreditNoteRepository.class);
        invoiceRepository = mock(InvoiceRepository.class);
        service = new CreditNoteService(creditNoteRepository, invoiceRepository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(creditNoteRepository.findByInstitutionIdOrderByNoteDateDesc(1L)).thenReturn(List.of());
        List<CreditNoteResponse> result = service.findAll(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void create_generatesNoteAndUpdatesInvoice() {
        Invoice inv = new Invoice();
        inv.setId(1L);
        inv.setTotal(new BigDecimal("500.00"));
        inv.setPaidAmount(new BigDecimal("0.00"));
        inv.setStatus("PENDIENTE");
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(inv));
        when(creditNoteRepository.findByInstitutionIdOrderByNoteDateDesc(1L)).thenReturn(List.of());
        when(creditNoteRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        CreditNoteResponse result = service.create(1L, 10L, 1L, new BigDecimal("100.00"), "Descuento");
        assertNotNull(result.noteNumber);
        assertEquals("PARCIAL", inv.getStatus());
    }

    @Test
    void apply_setsAppliedStatus() {
        CreditNote cn = new CreditNote();
        cn.setId(1L);
        cn.setStatus("PENDING");
        when(creditNoteRepository.findById(1L)).thenReturn(Optional.of(cn));
        when(creditNoteRepository.save(any())).thenReturn(cn);
        CreditNoteResponse result = service.apply(1L);
        assertEquals("APPLIED", cn.getStatus());
    }

    @Test
    void apply_throwsWhenNotPending() {
        CreditNote cn = new CreditNote();
        cn.setId(1L);
        cn.setStatus("APPLIED");
        when(creditNoteRepository.findById(1L)).thenReturn(Optional.of(cn));
        assertThrows(RuntimeException.class, () -> service.apply(1L));
    }

    @Test
    void cancel_revertsInvoiceAndSetsCancelled() {
        CreditNote cn = new CreditNote();
        cn.setId(1L);
        cn.setStatus("PENDING");
        cn.setInvoiceId(1L);
        cn.setAmount(new BigDecimal("100.00"));
        when(creditNoteRepository.findById(1L)).thenReturn(Optional.of(cn));
        when(creditNoteRepository.save(any())).thenReturn(cn);

        Invoice inv = new Invoice();
        inv.setId(1L);
        inv.setPaidAmount(new BigDecimal("100.00"));
        inv.setStatus("PARCIAL");
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(inv));
        when(invoiceRepository.save(any())).thenReturn(inv);

        CreditNoteResponse result = service.cancel(1L);
        assertEquals("CANCELLED", cn.getStatus());
        assertEquals("PENDIENTE", inv.getStatus());
    }
}
