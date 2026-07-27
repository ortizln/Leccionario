package com.leccionario.backend.rrhh.web;

import com.leccionario.backend.rrhh.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr/vacations")
public class VacationController {

    private final VacationService vacationService;

    public VacationController(VacationService vacationService) {
        this.vacationService = vacationService;
    }

    @GetMapping("/employee/{employeeId}/periods")
    public ResponseEntity<?> getPeriods(@PathVariable Long employeeId) {
        return ResponseEntity.ok(vacationService.findPeriods(employeeId));
    }

    @GetMapping("/employee/{employeeId}/period/{year}")
    public ResponseEntity<?> getOrCreatePeriod(@PathVariable Long employeeId, @PathVariable Integer year) {
        return ResponseEntity.ok(vacationService.getOrCreatePeriod(employeeId, year));
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody VacationRequest request, Authentication auth) {
        return ResponseEntity.ok(vacationService.createRequest(request, auth.getName()));
    }

    @GetMapping("/requests/employee/{employeeId}")
    public ResponseEntity<?> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(vacationService.findByEmployee(employeeId));
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<?> findPending() { return ResponseEntity.ok(vacationService.findPending()); }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(vacationService.approveRequest(id, auth.getName()));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(vacationService.rejectRequest(id, auth.getName()));
    }
}
