package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreditNoteResponse {
    public Long id;
    public Long institutionId;
    public String noteNumber;
    public Long invoiceId;
    public Long studentId;
    public LocalDate noteDate;
    public BigDecimal amount;
    public String reason;
    public String status;
    public String observations;
}
