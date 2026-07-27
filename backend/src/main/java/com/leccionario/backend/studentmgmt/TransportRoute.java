package com.leccionario.backend.studentmgmt;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "transport_routes")
public class TransportRoute extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "route_name", nullable = false, length = 150)
    private String routeName;

    @Column(name = "route_code", length = 10)
    private String routeCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200)
    private String origin;

    @Column(length = 200)
    private String destination;

    @Column(columnDefinition = "TEXT")
    private String stops;

    @Column(name = "morning_departure")
    private LocalTime morningDeparture;

    @Column(name = "morning_arrival")
    private LocalTime morningArrival;

    @Column(name = "afternoon_departure")
    private LocalTime afternoonDeparture;

    @Column(name = "afternoon_arrival")
    private LocalTime afternoonArrival;

    @Column(nullable = false)
    private Integer capacity = 0;

    @Column(name = "vehicle_plate", length = 20)
    private String vehiclePlate;

    @Column(name = "driver_name", length = 200)
    private String driverName;

    @Column(name = "driver_phone", length = 20)
    private String driverPhone;

    @Column(name = "monthly_fee", precision = 8, scale = 2)
    private BigDecimal monthlyFee;

    @Column(nullable = false, length = 15)
    private String status = "ACTIVA";

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }
    public String getRouteCode() { return routeCode; }
    public void setRouteCode(String routeCode) { this.routeCode = routeCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getStops() { return stops; }
    public void setStops(String stops) { this.stops = stops; }
    public LocalTime getMorningDeparture() { return morningDeparture; }
    public void setMorningDeparture(LocalTime morningDeparture) { this.morningDeparture = morningDeparture; }
    public LocalTime getMorningArrival() { return morningArrival; }
    public void setMorningArrival(LocalTime morningArrival) { this.morningArrival = morningArrival; }
    public LocalTime getAfternoonDeparture() { return afternoonDeparture; }
    public void setAfternoonDeparture(LocalTime afternoonDeparture) { this.afternoonDeparture = afternoonDeparture; }
    public LocalTime getAfternoonArrival() { return afternoonArrival; }
    public void setAfternoonArrival(LocalTime afternoonArrival) { this.afternoonArrival = afternoonArrival; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getVehiclePlate() { return vehiclePlate; }
    public void setVehiclePlate(String vehiclePlate) { this.vehiclePlate = vehiclePlate; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    public BigDecimal getMonthlyFee() { return monthlyFee; }
    public void setMonthlyFee(BigDecimal monthlyFee) { this.monthlyFee = monthlyFee; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
