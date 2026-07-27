package com.leccionario.backend.notification.scheduler;

import com.leccionario.backend.communication.EmailService;
import com.leccionario.backend.communication.WhatsAppService;
import com.leccionario.backend.communication.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);
    private final JdbcTemplate jdbc;
    private final EmailService emailService;
    private final WhatsAppService whatsappService;
    private final SmsService smsService;

    public NotificationScheduler(JdbcTemplate jdbc, EmailService emailService,
                                  WhatsAppService whatsappService, SmsService smsService) {
        this.jdbc = jdbc;
        this.emailService = emailService;
        this.whatsappService = whatsappService;
        this.smsService = smsService;
    }

    @Scheduled(cron = "0 0 7 * * MON-FRI")
    public void sendAttendanceReminders() {
        log.info("SCHEDULER: Sending attendance reminders");
        try {
            List<Map<String, Object>> students = jdbc.queryForList(
                "SELECT s.id, u.first_name, u.email FROM students s " +
                "JOIN users u ON s.user_id = u.id " +
                "WHERE s.institution_id IS NOT NULL LIMIT 100");
            for (Map<String, Object> s : students) {
                String name = (String) s.get("first_name");
                String email = (String) s.get("email");
                if (email != null) {
                    emailService.sendEmail(email, "Recordatorio de Asistencia",
                        "Estimado/a " + name + ", recuerde marcar su asistencia hoy.");
                }
            }
        } catch (Exception e) {
            log.error("Failed to send attendance reminders: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 8 * * MON")
    public void sendOverdueLoanAlerts() {
        log.info("SCHEDULER: Checking overdue library loans");
        try {
            List<Map<String, Object>> overdue = jdbc.queryForList(
                "SELECT bl.id, bl.student_id, b.title FROM book_loans bl " +
                "JOIN books b ON bl.book_id = b.id " +
                "WHERE bl.status = 'VENCIDO' OR (bl.status = 'ACTIVO' AND bl.due_date < CURRENT_DATE)");
            for (Map<String, Object> loan : overdue) {
                log.info("Overdue loan: Book '{}' for student #{}", loan.get("title"), loan.get("student_id"));
            }
        } catch (Exception e) {
            log.error("Failed to check overdue loans: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 9 1 * *")
    public void sendMonthlyFinanceSummary() {
        log.info("SCHEDULER: Generating monthly finance summary");
        try {
            List<Map<String, Object>> institutions = jdbc.queryForList(
                "SELECT DISTINCT institution_id FROM invoices WHERE status != 'PAGADA'");
            for (Map<String, Object> inst : institutions) {
                Long instId = ((Number) inst.get("institution_id")).longValue();
                Long pendingCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM invoices WHERE institution_id = ? AND status != 'PAGADA'",
                    Long.class, instId);
                log.info("Institution #{}: {} pending invoices", instId, pendingCount);
            }
        } catch (Exception e) {
            log.error("Failed to generate monthly finance summary: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 10 * * *")
    public void checkExpiringWarranties() {
        log.info("SCHEDULER: Checking expiring warranties");
        try {
            Long expiring = jdbc.queryForObject(
                "SELECT COUNT(*) FROM asset_warranties WHERE status = 'VIGENTE' AND end_date <= CURRENT_DATE + INTERVAL '30 days'",
                Long.class);
            log.info("Expiring warranties in 30 days: {}", expiring);
        } catch (Exception e) {
            log.error("Failed to check warranties: {}", e.getMessage());
        }
    }
}
