package com.leccionario.backend.finance;

import java.math.BigDecimal;

public class StudentTuitionResponse {
    public Long id;
    public Long studentId;
    public Long planId;
    public String planName;
    public Long periodId;
    public String periodName;
    public Long enrollmentId;
    public BigDecimal totalAmount;
    public BigDecimal paidAmount;
    public String status;
}
