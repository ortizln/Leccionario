package com.leccionario.backend.finance;

import java.math.BigDecimal;

public class InvoiceItemResponse {
    public Long id;
    public String description;
    public BigDecimal quantity;
    public BigDecimal unitPrice;
    public BigDecimal subtotal;
}
