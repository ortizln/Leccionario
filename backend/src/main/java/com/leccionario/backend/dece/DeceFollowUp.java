package com.leccionario.backend.dece;

import jakarta.persistence.*;

@Entity
@Table(name = "dece_follow_ups")
public class DeceFollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", nullable = false)
    private Long caseId;

    @Column(nullable = false)
    private java.time.LocalDate date = java.time.LocalDate.now();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Column(name = "actions_taken", columnDefinition = "TEXT")
    private String actionsTaken;

    @Column(name = "next_steps", columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private java.time.Instant createdAt = java.time.Instant.now();

    public Long getId() { return id; }
    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }
    public java.time.LocalDate getDate() { return date; }
    public void setDate(java.time.LocalDate date) { this.date = date; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getActionsTaken() { return actionsTaken; }
    public void setActionsTaken(String actionsTaken) { this.actionsTaken = actionsTaken; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public java.time.Instant getCreatedAt() { return createdAt; }
}
