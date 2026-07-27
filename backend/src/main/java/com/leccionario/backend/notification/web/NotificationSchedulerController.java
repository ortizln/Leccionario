package com.leccionario.backend.notification.web;

import com.leccionario.backend.notification.scheduler.NotificationScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;

@RestController
@RequestMapping("/api/notification-scheduler")
@CrossOrigin(origins = "*")
@Tag(name = "Programador de Notificaciones")
public class NotificationSchedulerController {

    private final NotificationScheduler scheduler;

    public NotificationSchedulerController(NotificationScheduler scheduler) {
        this.scheduler = scheduler;
    }

    @Operation(summary = "Disparar recordatorios de asistencia manualmente")
    @PostMapping("/trigger/attendance-reminders")
    public ResponseEntity<Map<String, String>> triggerAttendanceReminders() {
        scheduler.sendAttendanceReminders();
        return ResponseEntity.ok(Map.of("status", "ok", "task", "attendance-reminders"));
    }

    @Operation(summary = "Disparar alertas de préstamos vencidos manualmente")
    @PostMapping("/trigger/overdue-loans")
    public ResponseEntity<Map<String, String>> triggerOverdueLoans() {
        scheduler.sendOverdueLoanAlerts();
        return ResponseEntity.ok(Map.of("status", "ok", "task", "overdue-loans"));
    }

    @Operation(summary = "Disparar resumen financiero mensual manualmente")
    @PostMapping("/trigger/monthly-finance")
    public ResponseEntity<Map<String, String>> triggerMonthlyFinance() {
        scheduler.sendMonthlyFinanceSummary();
        return ResponseEntity.ok(Map.of("status", "ok", "task", "monthly-finance"));
    }

    @Operation(summary = "Disparar verificación de garantías por vencer manualmente")
    @PostMapping("/trigger/warranty-alerts")
    public ResponseEntity<Map<String, String>> triggerWarrantyAlerts() {
        scheduler.checkExpiringWarranties();
        return ResponseEntity.ok(Map.of("status", "ok", "task", "warranty-alerts"));
    }

    @Operation(summary = "Disparar todas las tareas programadas")
    @PostMapping("/trigger/all")
    public ResponseEntity<Map<String, String>> triggerAll() {
        scheduler.sendAttendanceReminders();
        scheduler.sendOverdueLoanAlerts();
        scheduler.sendMonthlyFinanceSummary();
        scheduler.checkExpiringWarranties();
        return ResponseEntity.ok(Map.of("status", "ok", "task", "all"));
    }

    @Operation(summary = "Estado del programador de notificaciones")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "active",
            "tasks", Map.of(
                "attendance-reminders", "MON-FRI 07:00",
                "overdue-loans", "MON 08:00",
                "monthly-finance", "1st of month 09:00",
                "warranty-alerts", "DAILY 10:00"
            )
        ));
    }
}
