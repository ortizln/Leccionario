package com.leccionario.backend.studentmgmt;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "club_memberships")
public class ClubMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "club_id", nullable = false)
    private Long clubId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate = LocalDate.now();

    @Column(nullable = false, length = 20)
    private String role = "MIEMBRO";

    @Column(nullable = false, length = 15)
    private String status = "ACTIVO";

    @Column(name = "created_at")
    private java.time.Instant createdAt = java.time.Instant.now();

    public Long getId() { return id; }
    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.time.Instant getCreatedAt() { return createdAt; }
}
