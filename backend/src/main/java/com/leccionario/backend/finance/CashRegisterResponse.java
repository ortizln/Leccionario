package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

public class CashRegisterResponse {
    public Long id;
    public Long institutionId;
    public LocalDate registerDate;
    public BigDecimal openingBalance;
    public BigDecimal closingBalance;
    public BigDecimal totalIncome;
    public BigDecimal totalExpenses;
    public String status;
    public String openedBy;
    public String closedBy;
    public Instant openedAt;
    public Instant closedAt;
    public String notes;
}
