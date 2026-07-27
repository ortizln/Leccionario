package com.leccionario.backend.studentmgmt;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class ScholarshipService {

    private final ScholarshipTypeRepository typeRepo;
    private final ScholarshipApplicationRepository appRepo;

    public ScholarshipService(ScholarshipTypeRepository typeRepo, ScholarshipApplicationRepository appRepo) {
        this.typeRepo = typeRepo;
        this.appRepo = appRepo;
    }

    public ScholarshipType createType(ScholarshipType type) { return typeRepo.save(type); }
    public List<ScholarshipType> findTypes(Long institutionId) { return typeRepo.findByInstitutionIdAndActiveTrueOrderByName(institutionId); }
    public void deleteType(Long id) { typeRepo.deleteById(id); }

    public ScholarshipApplication createApplication(ScholarshipApplication app) { return appRepo.save(app); }
    public List<ScholarshipApplication> findByStudent(Long studentId) { return appRepo.findByStudentIdOrderByApplicationDateDesc(studentId); }
    public List<ScholarshipApplication> findPending() { return appRepo.findByStatusOrderByApplicationDateDesc("PENDIENTE"); }

    public ScholarshipApplication approve(Long id, String reviewedBy, java.math.BigDecimal amount) {
        ScholarshipApplication app = appRepo.findById(id).orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        app.setStatus("APROBADA");
        app.setReviewedBy(reviewedBy);
        app.setReviewDate(LocalDate.now());
        app.setAwardAmount(amount);
        return appRepo.save(app);
    }

    public ScholarshipApplication reject(Long id, String reviewedBy, String observations) {
        ScholarshipApplication app = appRepo.findById(id).orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        app.setStatus("RECHAZADA");
        app.setReviewedBy(reviewedBy);
        app.setReviewDate(LocalDate.now());
        app.setObservations(observations);
        return appRepo.save(app);
    }

    public java.util.Map<String, Object> getStats(Long institutionId) {
        List<ScholarshipType> types = typeRepo.findByInstitutionIdAndActiveTrueOrderByName(institutionId);
        List<ScholarshipApplication> all = appRepo.findAll();
        long pending = all.stream().filter(a -> "PENDIENTE".equals(a.getStatus())).count();
        long approved = all.stream().filter(a -> "APROBADA".equals(a.getStatus())).count();
        long rejected = all.stream().filter(a -> "RECHAZADA".equals(a.getStatus())).count();
        java.math.BigDecimal totalAwarded = all.stream().filter(a -> "APROBADA".equals(a.getStatus()) && a.getAwardAmount() != null)
                .map(ScholarshipApplication::getAwardAmount).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        return java.util.Map.of("types", types.size(), "pending", pending, "approved", approved, "rejected", rejected, "totalAwarded", totalAwarded);
    }
}
