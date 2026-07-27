package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.Instant;

public class CashTransactionResponse {
    public Long id;
    public Long registerId;
    public String transactionType;
    public String category;
    public String description;
    public BigDecimal amount;
    public String paymentMethod;
    public String referenceNumber;
    public Long studentId;
    public Long invoiceId;
    public String createdBy;
    public Instant createdAt;
}
