package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceRequest {
    public Long institutionId;
    public Long studentId;
    public Long periodId;
    public LocalDate invoiceDate;
    public LocalDate dueDate;
    public String concept;
    public String observations;
    public List<InvoiceItemRequest> items;
}
