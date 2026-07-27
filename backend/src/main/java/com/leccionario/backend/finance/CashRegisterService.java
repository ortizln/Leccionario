package com.leccionario.backend.finance;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CashRegisterService {

    private final CashRegisterRepository cashRegisterRepository;
    private final CashTransactionRepository cashTransactionRepository;

    public CashRegisterService(CashRegisterRepository cashRegisterRepository, CashTransactionRepository cashTransactionRepository) {
        this.cashRegisterRepository = cashRegisterRepository;
        this.cashTransactionRepository = cashTransactionRepository;
    }

    public List<CashRegisterResponse> findAll(Long institutionId) {
        return cashRegisterRepository.findByInstitutionIdOrderByRegisterDateDesc(institutionId).stream()
                .map(this::toResponse).toList();
    }

    public CashRegisterResponse findById(Long id) {
        CashRegister cr = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cash register not found"));
        return toResponse(cr);
    }

    public CashRegisterResponse findOpenRegister(Long institutionId, LocalDate date) {
        CashRegister cr = cashRegisterRepository.findByInstitutionIdAndRegisterDateAndStatus(institutionId, date, "ABIERTA");
        return cr != null ? toResponse(cr) : null;
    }

    @Transactional
    public CashRegisterResponse open(CashRegisterRequest req) {
        LocalDate today = req.institutionId != null ? LocalDate.now() : LocalDate.now();
        CashRegister existing = cashRegisterRepository.findByInstitutionIdAndRegisterDateAndStatus(req.institutionId, LocalDate.now(), "ABIERTA");
        if (existing != null) throw new RuntimeException("Already an open cash register for today");
        CashRegister cr = new CashRegister();
        cr.setInstitutionId(req.institutionId);
        cr.setOpeningBalance(req.openingBalance != null ? req.openingBalance : BigDecimal.ZERO);
        cr.setNotes(req.notes);
        cr.setStatus("ABIERTA");
        return toResponse(cashRegisterRepository.save(cr));
    }

    @Transactional
    public CashRegisterResponse close(Long id, String closedBy, BigDecimal closingBalance) {
        CashRegister cr = cashRegisterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cash register not found"));
        List<CashTransaction> txns = cashTransactionRepository.findByRegisterIdOrderByCreatedAtDesc(id);
        BigDecimal income = txns.stream().filter(t -> "INGRESO".equals(t.getTransactionType())).map(CashTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal expenses = txns.stream().filter(t -> "EGRESO".equals(t.getTransactionType())).map(CashTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        cr.setStatus("CERRADA");
        cr.setClosedBy(closedBy);
        cr.setClosedAt(Instant.now());
        cr.setTotalIncome(income);
        cr.setTotalExpenses(expenses);
        cr.setClosingBalance(closingBalance);
        return toResponse(cashRegisterRepository.save(cr));
    }

    @Transactional
    public CashTransactionResponse addTransaction(CashTransactionRequest req) {
        CashRegister cr = cashRegisterRepository.findById(req.registerId)
                .orElseThrow(() -> new RuntimeException("Cash register not found"));
        if (!"ABIERTA".equals(cr.getStatus())) throw new RuntimeException("Cash register is closed");
        CashTransaction tx = new CashTransaction();
        tx.setRegisterId(req.registerId);
        tx.setTransactionType(req.transactionType);
        tx.setCategory(req.category);
        tx.setDescription(req.description);
        tx.setAmount(req.amount);
        tx.setPaymentMethod(req.paymentMethod);
        tx.setReferenceNumber(req.referenceNumber);
        tx.setStudentId(req.studentId);
        tx.setInvoiceId(req.invoiceId);
        CashTransaction saved = cashTransactionRepository.save(tx);
        CashTransactionResponse resp = new CashTransactionResponse();
        resp.id = saved.getId();
        resp.registerId = saved.getRegisterId();
        resp.transactionType = saved.getTransactionType();
        resp.category = saved.getCategory();
        resp.description = saved.getDescription();
        resp.amount = saved.getAmount();
        resp.paymentMethod = saved.getPaymentMethod();
        resp.referenceNumber = saved.getReferenceNumber();
        resp.studentId = saved.getStudentId();
        resp.invoiceId = saved.getInvoiceId();
        return resp;
    }

    public List<CashTransactionResponse> getTransactions(Long registerId) {
        return cashTransactionRepository.findByRegisterIdOrderByCreatedAtDesc(registerId).stream()
                .map(t -> {
                    CashTransactionResponse resp = new CashTransactionResponse();
                    resp.id = t.getId();
                    resp.registerId = t.getRegisterId();
                    resp.transactionType = t.getTransactionType();
                    resp.category = t.getCategory();
                    resp.description = t.getDescription();
                    resp.amount = t.getAmount();
                    resp.paymentMethod = t.getPaymentMethod();
                    resp.referenceNumber = t.getReferenceNumber();
                    resp.studentId = t.getStudentId();
                    resp.invoiceId = t.getInvoiceId();
                    resp.createdAt = t.getCreatedAt();
                    return resp;
                }).toList();
    }

    private CashRegisterResponse toResponse(CashRegister cr) {
        CashRegisterResponse resp = new CashRegisterResponse();
        resp.id = cr.getId();
        resp.institutionId = cr.getInstitutionId();
        resp.registerDate = cr.getRegisterDate();
        resp.openingBalance = cr.getOpeningBalance();
        resp.closingBalance = cr.getClosingBalance();
        resp.totalIncome = cr.getTotalIncome();
        resp.totalExpenses = cr.getTotalExpenses();
        resp.status = cr.getStatus();
        resp.openedBy = cr.getOpenedBy();
        resp.closedBy = cr.getClosedBy();
        resp.openedAt = cr.getOpenedAt();
        resp.closedAt = cr.getClosedAt();
        resp.notes = cr.getNotes();
        return resp;
    }

    public List<java.util.Map<String, Object>> getCollectionMethods(Long institutionId) {
        return cashTransactionRepository.getCollectionMethodsByInstitution(institutionId);
    }

    public byte[] getDailyClosePdf(Long registerId) {
        CashRegister cr = cashRegisterRepository.findById(registerId)
                .orElseThrow(() -> new RuntimeException("Cash register not found"));
        List<CashTransaction> txns = cashTransactionRepository.findByRegisterIdOrderByCreatedAtDesc(registerId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);

            Paragraph title = new Paragraph("Cierre Diario de Caja", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Fecha: " + (cr.getRegisterDate() != null ? cr.getRegisterDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : ""), normalFont));
            document.add(new Paragraph("Estado: " + cr.getStatus(), normalFont));
            document.add(new Paragraph("Abierto por: " + (cr.getOpenedBy() != null ? cr.getOpenedBy() : "-"), normalFont));
            document.add(new Paragraph("Cerrado por: " + (cr.getClosedBy() != null ? cr.getClosedBy() : "-"), normalFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Saldo Inicial: $" + (cr.getOpeningBalance() != null ? cr.getOpeningBalance().setScale(2) : "0.00"), boldFont));
            document.add(new Paragraph("Total Ingresos: $" + (cr.getTotalIncome() != null ? cr.getTotalIncome().setScale(2) : "0.00"), normalFont));
            document.add(new Paragraph("Total Egresos: $" + (cr.getTotalExpenses() != null ? cr.getTotalExpenses().setScale(2) : "0.00"), normalFont));
            document.add(new Paragraph("Saldo Final: $" + (cr.getClosingBalance() != null ? cr.getClosingBalance().setScale(2) : "0.00"), boldFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidths(new float[]{15, 25, 25, 20, 15});
            addPdfCell(table, "Tipo", headerFont);
            addPdfCell(table, "Categoria", headerFont);
            addPdfCell(table, "Descripcion", headerFont);
            addPdfCell(table, "Monto", headerFont);
            addPdfCell(table, "Metodo", headerFont);

            for (CashTransaction t : txns) {
                addPdfCell(table, t.getTransactionType() != null ? t.getTransactionType() : "", normalFont);
                addPdfCell(table, t.getCategory() != null ? t.getCategory() : "", normalFont);
                addPdfCell(table, t.getDescription() != null ? t.getDescription() : "", normalFont);
                addPdfCell(table, "$" + (t.getAmount() != null ? t.getAmount().setScale(2) : "0.00"), normalFont);
                addPdfCell(table, t.getPaymentMethod() != null ? t.getPaymentMethod() : "", normalFont);
            }
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating daily close PDF", e);
        }
        return baos.toByteArray();
    }

    private void addPdfCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
