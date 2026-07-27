package com.leccionario.backend.finance;

import java.math.BigDecimal;

public class TuitionPlanRequest {
    public Long institutionId;
    public String name;
    public String description;
    public BigDecimal amount;
    public Boolean ivaIncluded;
    public String category;
    public Boolean active;
}
