package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceResponse {
    public Long id;
    public Long institutionId;
    public String invoiceNumber;
    public Long studentId;
    public String studentName;
    public Long periodId;
    public String periodName;
    public LocalDate invoiceDate;
    public LocalDate dueDate;
    public BigDecimal subtotal;
    public BigDecimal ivaPercent;
    public BigDecimal ivaAmount;
    public BigDecimal total;
    public BigDecimal paidAmount;
    public String status;
    public String concept;
    public String observations;
    public String sriAuthNumber;
    public List<InvoiceItemResponse> items;
}
