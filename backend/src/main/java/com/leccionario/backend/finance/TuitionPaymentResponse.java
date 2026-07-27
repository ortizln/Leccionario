package com.leccionario.backend.finance;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TuitionPaymentResponse {
    public Long id;
    public Long studentTuitionId;
    public LocalDate paymentDate;
    public BigDecimal amount;
    public String paymentMethod;
    public String reference;
    public String notes;
}
