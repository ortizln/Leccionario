package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.EmployeeAttendance;
import com.leccionario.backend.rrhh.EmployeeAttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/attendances")
public class EmployeeAttendanceController {
    private final EmployeeAttendanceService service;
    public EmployeeAttendanceController(EmployeeAttendanceService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<EmployeeAttendance>> findAll(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findAll(institutionId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeAttendance>> findByEmployee(@PathVariable Long employeeId, @RequestParam Long institutionId) {
        return ResponseEntity.ok(service.findByEmployee(employeeId, institutionId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<EmployeeAttendance>> findByDateRange(@RequestParam Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.findByDateRange(institutionId, from, to));
    }

    @PostMapping("/check-in/{employeeId}")
    public ResponseEntity<EmployeeAttendance> checkIn(@PathVariable Long employeeId, @RequestParam Long institutionId) {
        return ResponseEntity.ok(service.checkIn(employeeId, institutionId));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<EmployeeAttendance> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(service.checkOut(id));
    }

    @PostMapping
    public ResponseEntity<EmployeeAttendance> save(@RequestBody EmployeeAttendance att) {
        return ResponseEntity.ok(service.save(att));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(service.getStats(institutionId));
    }
}