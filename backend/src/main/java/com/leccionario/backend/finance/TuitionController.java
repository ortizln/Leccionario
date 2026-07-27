package com.leccionario.backend.finance;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/finance/tuitions")
@CrossOrigin(origins = "*")
public class TuitionController {

    private final TuitionPlanService tuitionPlanService;
    private final TuitionService tuitionService;

    public TuitionController(TuitionPlanService tuitionPlanService, TuitionService tuitionService) {
        this.tuitionPlanService = tuitionPlanService;
        this.tuitionService = tuitionService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<TuitionPlanResponse>> findAllPlans(@RequestParam Long institutionId) {
        return ResponseEntity.ok(tuitionPlanService.findAll(institutionId));
    }

    @GetMapping("/plans/active")
    public ResponseEntity<List<TuitionPlanResponse>> findActivePlans(@RequestParam Long institutionId) {
        return ResponseEntity.ok(tuitionPlanService.findActive(institutionId));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<TuitionPlanResponse> findPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionPlanService.findById(id));
    }

    @PostMapping("/plans")
    public ResponseEntity<TuitionPlanResponse> createPlan(@RequestBody TuitionPlanRequest req) {
        return ResponseEntity.ok(tuitionPlanService.create(req));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<TuitionPlanResponse> updatePlan(@PathVariable Long id, @RequestBody TuitionPlanRequest req) {
        return ResponseEntity.ok(tuitionPlanService.update(id, req));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        tuitionPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}/period/{periodId}")
    public ResponseEntity<List<StudentTuitionResponse>> findByStudentAndPeriod(@PathVariable Long studentId, @PathVariable Long periodId) {
        return ResponseEntity.ok(tuitionService.findByStudentAndPeriod(studentId, periodId));
    }

    @GetMapping("/period/{periodId}")
    public ResponseEntity<List<StudentTuitionResponse>> findByPeriod(@PathVariable Long periodId) {
        return ResponseEntity.ok(tuitionService.findByPeriod(periodId));
    }

    @PostMapping("/assign")
    public ResponseEntity<StudentTuitionResponse> assignPlan(@RequestBody java.util.Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long planId = Long.valueOf(body.get("planId").toString());
        Long periodId = Long.valueOf(body.get("periodId").toString());
        Long enrollmentId = body.get("enrollmentId") != null ? Long.valueOf(body.get("enrollmentId").toString()) : null;
        return ResponseEntity.ok(tuitionService.assignPlan(studentId, planId, periodId, enrollmentId));
    }

    @PostMapping("/{studentTuitionId}/payments")
    public ResponseEntity<TuitionPaymentResponse> addPayment(@PathVariable Long studentTuitionId, @RequestBody java.util.Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String paymentMethod = (String) body.getOrDefault("paymentMethod", "EFECTIVO");
        String notes = (String) body.getOrDefault("notes", "");
        return ResponseEntity.ok(tuitionService.addPayment(studentTuitionId, amount, paymentMethod, notes));
    }

    @GetMapping("/{studentTuitionId}/payments")
    public ResponseEntity<List<TuitionPaymentResponse>> getPayments(@PathVariable Long studentTuitionId) {
        return ResponseEntity.ok(tuitionService.getPayments(studentTuitionId));
    }
}
