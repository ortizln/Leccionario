package com.leccionario.backend.studentmgmt;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transport_assignments")
public class TransportAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "route_id", nullable = false)
    private Long routeId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "academic_year_id")
    private Long academicYearId;

    @Column(name = "assignment_date", nullable = false)
    private LocalDate assignmentDate = LocalDate.now();

    @Column(name = "pickup_point", length = 200)
    private String pickupPoint;

    @Column(name = "dropoff_point", length = 200)
    private String dropoffPoint;

    @Column(nullable = false, length = 10)
    private String shift = "MATUTINO";

    @Column(name = "monthly_fee", precision = 8, scale = 2)
    private BigDecimal monthlyFee;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVO";

    @Column(name = "created_at")
    private java.time.Instant createdAt = java.time.Instant.now();

    public Long getId() { return id; }
    public Long getRouteId() { return routeId; }
    public void setRouteId(Long routeId) { this.routeId = routeId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public LocalDate getAssignmentDate() { return assignmentDate; }
    public void setAssignmentDate(LocalDate assignmentDate) { this.assignmentDate = assignmentDate; }
    public String getPickupPoint() { return pickupPoint; }
    public void setPickupPoint(String pickupPoint) { this.pickupPoint = pickupPoint; }
    public String getDropoffPoint() { return dropoffPoint; }
    public void setDropoffPoint(String dropoffPoint) { this.dropoffPoint = dropoffPoint; }
    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }
    public BigDecimal getMonthlyFee() { return monthlyFee; }
    public void setMonthlyFee(BigDecimal monthlyFee) { this.monthlyFee = monthlyFee; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.time.Instant getCreatedAt() { return createdAt; }
}
