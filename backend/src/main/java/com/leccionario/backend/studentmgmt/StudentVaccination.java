package com.leccionario.backend.studentmgmt;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_vaccinations")
public class StudentVaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "vaccine_name", nullable = false, length = 150)
    private String vaccineName;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @Column(name = "dose_date", nullable = false)
    private LocalDate doseDate;

    @Column(name = "next_dose_date")
    private LocalDate nextDoseDate;

    @Column(name = "lot_number", length = 50)
    private String lotNumber;

    @Column(name = "administered_by", length = 200)
    private String administeredBy;

    @Column(length = 200)
    private String institution;

    @Column(nullable = false, length = 15)
    private String status = "COMPLETADA";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private java.time.Instant createdAt = java.time.Instant.now();

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getVaccineName() { return vaccineName; }
    public void setVaccineName(String vaccineName) { this.vaccineName = vaccineName; }
    public Integer getDoseNumber() { return doseNumber; }
    public void setDoseNumber(Integer doseNumber) { this.doseNumber = doseNumber; }
    public LocalDate getDoseDate() { return doseDate; }
    public void setDoseDate(LocalDate doseDate) { this.doseDate = doseDate; }
    public LocalDate getNextDoseDate() { return nextDoseDate; }
    public void setNextDoseDate(LocalDate nextDoseDate) { this.nextDoseDate = nextDoseDate; }
    public String getLotNumber() { return lotNumber; }
    public void setLotNumber(String lotNumber) { this.lotNumber = lotNumber; }
    public String getAdministeredBy() { return administeredBy; }
    public void setAdministeredBy(String administeredBy) { this.administeredBy = administeredBy; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public java.time.Instant getCreatedAt() { return createdAt; }
}
