package com.leccionario.backend.finance;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "credit_notes")
public class CreditNote extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "note_number", nullable = false, length = 30)
    private String noteNumber;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "note_date", nullable = false)
    private LocalDate noteDate = LocalDate.now();

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 100)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "sri_auth_number", length = 50)
    private String sriAuthNumber;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getNoteNumber() { return noteNumber; }
    public void setNoteNumber(String noteNumber) { this.noteNumber = noteNumber; }
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public LocalDate getNoteDate() { return noteDate; }
    public void setNoteDate(LocalDate noteDate) { this.noteDate = noteDate; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public String getSriAuthNumber() { return sriAuthNumber; }
    public void setSriAuthNumber(String sriAuthNumber) { this.sriAuthNumber = sriAuthNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
