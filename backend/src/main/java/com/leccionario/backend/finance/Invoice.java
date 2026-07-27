package com.leccionario.backend.finance;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "invoice_number", nullable = false, length = 30)
    private String invoiceNumber;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "period_id")
    private Long periodId;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "iva_percent", precision = 5, scale = 2)
    private BigDecimal ivaPercent = new BigDecimal("12.00");

    @Column(name = "iva_amount", precision = 12, scale = 2)
    private BigDecimal ivaAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 15)
    private String status = "PENDIENTE";

    @Column(length = 200)
    private String concept;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "sri_auth_number", length = 50)
    private String sriAuthNumber;

    @Column(name = "sri_clave_acceso", length = 50)
    private String sriClaveAcceso;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getPeriodId() { return periodId; }
    public void setPeriodId(Long periodId) { this.periodId = periodId; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getIvaPercent() { return ivaPercent; }
    public void setIvaPercent(BigDecimal ivaPercent) { this.ivaPercent = ivaPercent; }
    public BigDecimal getIvaAmount() { return ivaAmount; }
    public void setIvaAmount(BigDecimal ivaAmount) { this.ivaAmount = ivaAmount; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getConcept() { return concept; }
    public void setConcept(String concept) { this.concept = concept; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public String getSriAuthNumber() { return sriAuthNumber; }
    public void setSriAuthNumber(String sriAuthNumber) { this.sriAuthNumber = sriAuthNumber; }
    public String getSriClaveAcceso() { return sriClaveAcceso; }
    public void setSriClaveAcceso(String sriClaveAcceso) { this.sriClaveAcceso = sriClaveAcceso; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
