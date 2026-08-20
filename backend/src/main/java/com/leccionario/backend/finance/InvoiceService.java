package com.leccionario.backend.finance;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, InvoiceItemRepository invoiceItemRepository) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
    }

    public List<InvoiceResponse> findAll(Long institutionId) {
        return invoiceRepository.findByInstitutionIdOrderByInvoiceDateDesc(institutionId).stream()
                .map(this::toResponse).toList();
    }

    public Page<InvoiceResponse> findAll(Long institutionId, Pageable pageable) {
        return invoiceRepository.findByInstitutionId(institutionId, pageable).map(this::toResponse);
    }

    public List<InvoiceResponse> findByStudent(Long studentId) {
        return invoiceRepository.findByStudentIdOrderByInvoiceDateDesc(studentId).stream()
                .map(this::toResponse).toList();
    }

    public InvoiceResponse findById(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest req) {
        Invoice inv = new Invoice();
        inv.setInstitutionId(req.institutionId);
        inv.setStudentId(req.studentId);
        inv.setPeriodId(req.periodId);
        inv.setInvoiceDate(req.invoiceDate != null ? req.invoiceDate : LocalDate.now());
        inv.setDueDate(req.dueDate);
        inv.setConcept(req.concept);
        inv.setObservations(req.observations);
        inv.setInvoiceNumber(generateInvoiceNumber(req.institutionId));
        inv.setStatus("PENDIENTE");
        BigDecimal total = BigDecimal.ZERO;
        Invoice saved = invoiceRepository.save(inv);
        if (req.items != null) {
            for (InvoiceItemRequest ir : req.items) {
                InvoiceItem item = new InvoiceItem();
                item.setInvoiceId(saved.getId());
                item.setDescription(ir.description);
                item.setQuantity(ir.quantity != null ? ir.quantity : BigDecimal.ONE);
                item.setUnitPrice(ir.unitPrice);
                item.setSubtotal(item.getQuantity().multiply(item.getUnitPrice()));
                invoiceItemRepository.save(item);
                total = total.add(item.getSubtotal());
            }
        }
        BigDecimal iva = total.multiply(new BigDecimal("0.12"));
        saved.setSubtotal(total);
        saved.setIvaAmount(iva);
        saved.setTotal(total.add(iva));
        invoiceRepository.save(saved);
        return findById(saved.getId());
    }

    @Transactional
    public InvoiceResponse addPayment(Long invoiceId, BigDecimal amount, String paymentMethod) {
        Invoice inv = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        BigDecimal newPaid = inv.getPaidAmount().add(amount);
        inv.setPaidAmount(newPaid);
        if (newPaid.compareTo(inv.getTotal()) >= 0) {
            inv.setStatus("PAGADA");
        } else {
            inv.setStatus("PARCIAL");
        }
        invoiceRepository.save(inv);
        return findById(invoiceId);
    }

    public byte[] getPaymentReceiptPdf(Long invoiceId, BigDecimal paymentAmount, String paymentMethod) {
        Invoice inv = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Comprobante de Pago", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Fecha: " + java.time.LocalDate.now().format(fmt), normalFont));
            document.add(new Paragraph("Factura: " + inv.getInvoiceNumber(), boldFont));
            document.add(new Paragraph("Estudiante ID: " + inv.getStudentId(), normalFont));
            document.add(new Paragraph("Concepto: " + inv.getConcept(), normalFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Monto Pagado: $" + paymentAmount.setScale(2), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(new Paragraph("Metodo de Pago: " + paymentMethod, normalFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total Factura: $" + (inv.getTotal() != null ? inv.getTotal().setScale(2) : "0.00"), normalFont));
            document.add(new Paragraph("Total Pagado: $" + (inv.getPaidAmount() != null ? inv.getPaidAmount().setScale(2) : "0.00"), normalFont));
            java.math.BigDecimal balance = inv.getTotal().subtract(inv.getPaidAmount() != null ? inv.getPaidAmount() : java.math.BigDecimal.ZERO);
            document.add(new Paragraph("Saldo Pendiente: $" + balance.setScale(2), boldFont));
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating payment receipt PDF", e);
        }
        return baos.toByteArray();
    }

    public List<InvoiceResponse> findOverdue() {
        return invoiceRepository.findByStatusAndDueDateBefore("PENDIENTE", LocalDate.now()).stream()
                .map(this::toResponse).toList();
    }

    private String generateInvoiceNumber(Long institutionId) {
        long count = invoiceRepository.findByInstitutionIdOrderByInvoiceDateDesc(institutionId).size();
        return String.format("FAC-%05d", count + 1);
    }

    private InvoiceResponse toResponse(Invoice inv) {
        InvoiceResponse resp = new InvoiceResponse();
        resp.id = inv.getId();
        resp.institutionId = inv.getInstitutionId();
        resp.invoiceNumber = inv.getInvoiceNumber();
        resp.studentId = inv.getStudentId();
        resp.periodId = inv.getPeriodId();
        resp.invoiceDate = inv.getInvoiceDate();
        resp.dueDate = inv.getDueDate();
        resp.subtotal = inv.getSubtotal();
        resp.ivaPercent = inv.getIvaPercent();
        resp.ivaAmount = inv.getIvaAmount();
        resp.total = inv.getTotal();
        resp.paidAmount = inv.getPaidAmount();
        resp.status = inv.getStatus();
        resp.concept = inv.getConcept();
        resp.observations = inv.getObservations();
        resp.sriAuthNumber = inv.getSriAuthNumber();
        resp.items = invoiceItemRepository.findByInvoiceId(inv.getId()).stream().map(item -> {
            InvoiceItemResponse ir = new InvoiceItemResponse();
            ir.id = item.getId();
            ir.description = item.getDescription();
            ir.quantity = item.getQuantity();
            ir.unitPrice = item.getUnitPrice();
            ir.subtotal = item.getSubtotal();
            return ir;
        }).toList();
        return resp;
    }

    public byte[] getAccountStatementPdf(Long studentId, Long institutionId) {
        List<Invoice> invoices = invoiceRepository.findByStudentIdOrderByInvoiceDateDesc(studentId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

            Paragraph title = new Paragraph("Estado de Cuenta - Estudiante", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            Paragraph studentInfo = new Paragraph();
            studentInfo.add(new Paragraph("ID Estudiante: " + studentId, normalFont));
            studentInfo.add(new Paragraph("Fecha: " + LocalDate.now().format(fmt), normalFont));
            document.add(studentInfo);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{12, 14, 22, 14, 14, 14, 10});

            String[] headers = {"Fecha", "Factura", "Concepto", "Total", "Pagado", "Pendiente", "Estado"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(new java.awt.Color(50, 50, 50));
                cell.setPadding(6);
                table.addCell(cell);
            }

            BigDecimal totalGeneral = BigDecimal.ZERO;
            BigDecimal pagadoGeneral = BigDecimal.ZERO;
            BigDecimal pendienteGeneral = BigDecimal.ZERO;

            for (Invoice inv : invoices) {
                BigDecimal total = inv.getTotal() != null ? inv.getTotal() : BigDecimal.ZERO;
                BigDecimal pagado = inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO;
                BigDecimal pendiente = total.subtract(pagado);

                totalGeneral = totalGeneral.add(total);
                pagadoGeneral = pagadoGeneral.add(pagado);
                pendienteGeneral = pendienteGeneral.add(pendiente);

                addCell(table, inv.getInvoiceDate() != null ? inv.getInvoiceDate().format(fmt) : "", normalFont);
                addCell(table, inv.getInvoiceNumber(), normalFont);
                addCell(table, inv.getConcept(), normalFont);
                addCellRight(table, "$" + total.setScale(2).toString(), normalFont);
                addCellRight(table, "$" + pagado.setScale(2).toString(), normalFont);
                addCellRight(table, "$" + pendiente.setScale(2).toString(), normalFont);
                addCell(table, inv.getStatus(), normalFont);
            }

            addSummaryRow(table, "TOTALES", "$" + totalGeneral.setScale(2).toString(),
                    "$" + pagadoGeneral.setScale(2).toString(),
                    "$" + pendienteGeneral.setScale(2).toString(), summaryFont);

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addCellRight(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, String total, String pagado, String pendiente, Font font) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setColspan(3);
        labelCell.setPadding(6);
        labelCell.setBackgroundColor(new java.awt.Color(220, 220, 220));
        table.addCell(labelCell);

        PdfPCell totalCell = new PdfPCell(new Paragraph(total, font));
        totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalCell.setPadding(6);
        totalCell.setBackgroundColor(new java.awt.Color(220, 220, 220));
        table.addCell(totalCell);

        PdfPCell pagadoCell = new PdfPCell(new Paragraph(pagado, font));
        pagadoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        pagadoCell.setPadding(6);
        pagadoCell.setBackgroundColor(new java.awt.Color(220, 220, 220));
        table.addCell(pagadoCell);

        PdfPCell pendienteCell = new PdfPCell(new Paragraph(pendiente, font));
        pendienteCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        pendienteCell.setPadding(6);
        pendienteCell.setBackgroundColor(new java.awt.Color(220, 220, 220));
        table.addCell(pendienteCell);

        PdfPCell emptyCell = new PdfPCell(new Paragraph("", font));
        emptyCell.setBackgroundColor(new java.awt.Color(220, 220, 220));
        table.addCell(emptyCell);
    }

    public byte[] getInvoicePdf(Long invoiceId) {
        Invoice inv = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            Paragraph title = new Paragraph("Factura", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Numero: " + inv.getInvoiceNumber(), boldFont));
            document.add(new Paragraph("Fecha: " + (inv.getInvoiceDate() != null ? inv.getInvoiceDate().format(fmt) : ""), normalFont));
            document.add(new Paragraph("Vencimiento: " + (inv.getDueDate() != null ? inv.getDueDate().format(fmt) : ""), normalFont));
            document.add(new Paragraph("Estado: " + inv.getStatus(), normalFont));
            document.add(new Paragraph("Concepto: " + inv.getConcept(), normalFont));
            document.add(new Paragraph("Estudiante ID: " + inv.getStudentId(), normalFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidths(new float[]{30, 25, 20, 25});
            addCell(table, "Detalle", headerFont);
            addCellRight(table, "Cant.", headerFont);
            addCellRight(table, "P.U.", headerFont);
            addCellRight(table, "Subtotal", headerFont);

            BigDecimal total = BigDecimal.ZERO;
            for (InvoiceItem item : items) {
                addCell(table, item.getDescription() != null ? item.getDescription() : "", normalFont);
                addCellRight(table, item.getQuantity() != null ? item.getQuantity().toString() : "1", normalFont);
                addCellRight(table, "$" + (item.getUnitPrice() != null ? item.getUnitPrice().setScale(2) : "0.00"), normalFont);
                addCellRight(table, "$" + (item.getSubtotal() != null ? item.getSubtotal().setScale(2) : "0.00"), normalFont);
                if (item.getSubtotal() != null) total = total.add(item.getSubtotal());
            }

            Paragraph totalP = new Paragraph("TOTAL: $" + total.setScale(2), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
            totalP.setAlignment(Element.ALIGN_RIGHT);
            document.add(table);
            document.add(new Paragraph(" "));
            document.add(totalP);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Pagado: $" + (inv.getPaidAmount() != null ? inv.getPaidAmount().setScale(2) : "0.00"), normalFont));
            java.math.BigDecimal balance = total.subtract(inv.getPaidAmount() != null ? inv.getPaidAmount() : java.math.BigDecimal.ZERO);
            document.add(new Paragraph("Pendiente: $" + balance.setScale(2), boldFont));
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating invoice PDF", e);
        }
        return baos.toByteArray();
    }
}
