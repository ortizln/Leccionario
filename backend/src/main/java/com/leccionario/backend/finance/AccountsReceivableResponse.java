package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AccountsReceivableResponse {
    public Long id;
    public Long institutionId;
    public Long studentId;
    public Long invoiceId;
    public String description;
    public BigDecimal originalAmount;
    public BigDecimal paidAmount;
    public LocalDate dueDate;
    public String status;
}
