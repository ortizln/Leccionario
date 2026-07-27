package com.leccionario.backend.finance;

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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceItemRepository invoiceItemRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    @Test
    void findAll_returnsListOfInvoices() {
        Invoice inv = new Invoice();
        inv.setId(1L);
        inv.setInstitutionId(1L);
        inv.setStudentId(10L);
        inv.setInvoiceNumber("INV-001");
        inv.setTotal(new BigDecimal("500.00"));
        inv.setPaidAmount(BigDecimal.ZERO);
        inv.setStatus("PENDIENTE");

        when(invoiceRepository.findByInstitutionIdOrderByInvoiceDateDesc(1L)).thenReturn(List.of(inv));

        var result = invoiceService.findAll(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("INV-001", result.get(0).invoiceNumber);
    }

    @Test
    void findById_existingInvoice_returnsResponse() {
        Invoice inv = new Invoice();
        inv.setId(1L);
        inv.setInstitutionId(1L);
        inv.setStudentId(10L);
        inv.setInvoiceNumber("INV-001");
        inv.setTotal(new BigDecimal("500.00"));

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(inv));

        var result = invoiceService.findById(1L);

        assertNotNull(result);
        assertEquals("INV-001", result.invoiceNumber);
    }

    @Test
    void findById_notExisting_throwsRuntimeException() {
        when(invoiceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> invoiceService.findById(99L));
    }

    @Test
    void create_setsCorrectDefaults() {
        InvoiceRequest req = new InvoiceRequest();
        req.institutionId = 1L;
        req.studentId = 10L;
        req.concept = "Matricula";

        Invoice saved = new Invoice();
        saved.setId(1L);
        saved.setInvoiceNumber("FAC-00001");
        saved.setInstitutionId(1L);
        saved.setStudentId(10L);
        saved.setTotal(BigDecimal.ZERO);
        saved.setPaidAmount(BigDecimal.ZERO);
        saved.setStatus("PENDIENTE");
        saved.setConcept("Matricula");

        when(invoiceRepository.findByInstitutionIdOrderByInvoiceDateDesc(1L)).thenReturn(List.of());
        when(invoiceRepository.save(any())).thenReturn(saved);
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(saved));

        var result = invoiceService.create(req);

        assertNotNull(result);
        assertEquals("PENDIENTE", result.status);
        verify(invoiceRepository, times(2)).save(any());
    }

    @Test
    void getInvoicePdf_returnsBytes() {
        Invoice inv = new Invoice();
        inv.setId(1L);
        inv.setInstitutionId(1L);
        inv.setStudentId(10L);
        inv.setInvoiceNumber("INV-001");
        inv.setTotal(new BigDecimal("500.00"));
        inv.setPaidAmount(new BigDecimal("200.00"));
        inv.setStatus("PARCIAL");
        inv.setConcept("Matricula");
        inv.setInvoiceDate(LocalDate.now());

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(inv));
        when(invoiceItemRepository.findByInvoiceId(1L)).thenReturn(List.of());

        byte[] pdf = invoiceService.getInvoicePdf(1L);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }

    @Test
    void getAccountStatementPdf_returnsBytes() {
        when(invoiceRepository.findByStudentIdOrderByInvoiceDateDesc(10L)).thenReturn(List.of());

        byte[] pdf = invoiceService.getAccountStatementPdf(10L, 1L);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
    }
}
