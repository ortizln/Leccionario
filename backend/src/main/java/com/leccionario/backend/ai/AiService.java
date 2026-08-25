package com.leccionario.backend.ai;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final AiModelRepository modelRepository;
    private final AiPredictionRepository predictionRepository;
    private final AiRecommendationRepository recommendationRepository;
    private final AiAnomalyRepository anomalyRepository;
    private final AiStudentProfileRepository profileRepository;
    private final JdbcTemplate jdbc;

    public AiService(AiModelRepository modelRepository, AiPredictionRepository predictionRepository,
                     AiRecommendationRepository recommendationRepository, AiAnomalyRepository anomalyRepository,
                     AiStudentProfileRepository profileRepository, JdbcTemplate jdbc) {
        this.modelRepository = modelRepository;
        this.predictionRepository = predictionRepository;
        this.recommendationRepository = recommendationRepository;
        this.anomalyRepository = anomalyRepository;
        this.profileRepository = profileRepository;
        this.jdbc = jdbc;
    }

    public List<AiModel> findAllModels(Long institutionId) {
        return modelRepository.findByInstitutionIdOrderByNameAsc(institutionId);
    }

    @Transactional
    public AiModel createModel(AiModel model) { return modelRepository.save(model); }

    @Transactional
    public void deleteModel(Long id) { modelRepository.deleteById(id); }

    public List<AiPrediction> getStudentPredictions(Long studentId) {
        return predictionRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public AiPrediction createPrediction(AiPrediction pred) { return predictionRepository.save(pred); }

    public List<AiRecommendation> getRecommendations(Long institutionId) {
        return recommendationRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<AiRecommendation> getPendingRecommendations(Long institutionId) {
        return recommendationRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "PENDIENTE");
    }

    @Transactional
    public AiRecommendation applyRecommendation(Long id) {
        AiRecommendation r = recommendationRepository.findById(id).orElseThrow(() -> new RuntimeException("Recommendation not found"));
        r.setStatus("APLICADA");
        r.setAppliedAt(Instant.now());
        return recommendationRepository.save(r);
    }

    @Transactional
    public void dismissRecommendation(Long id) {
        AiRecommendation r = recommendationRepository.findById(id).orElseThrow(() -> new RuntimeException("Recommendation not found"));
        r.setStatus("DESCARTADA");
        recommendationRepository.save(r);
    }

    public Map<String, Object> getRecommendationStats(Long institutionId) {
        long total = recommendationRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId).size();
        long pending = recommendationRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "PENDIENTE").size();
        long applied = recommendationRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "APLICADA").size();
        return Map.of("total", total, "pending", pending, "applied", applied);
    }

    public List<AiAnomaly> getAnomalies(Long institutionId) {
        return anomalyRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<AiAnomaly> getCriticalAnomalies() {
        return anomalyRepository.findBySeverityOrderByCreatedAtDesc("CRITICA");
    }

    @Transactional
    public AiAnomaly resolveAnomaly(Long id, String notes) {
        AiAnomaly a = anomalyRepository.findById(id).orElseThrow(() -> new RuntimeException("Anomaly not found"));
        a.setStatus("RESUELTA");
        a.setResolvedAt(Instant.now());
        a.setNotes(notes);
        return anomalyRepository.save(a);
    }

    public AiStudentProfile getStudentProfile(Long studentId, Long institutionId) {
        return profileRepository.findByStudentIdAndInstitutionId(studentId, institutionId).orElse(null);
    }

    public List<AiStudentProfile> getHighRiskStudents(Long institutionId) {
        return profileRepository.findByInstitutionIdOrderByAcademicRiskDesc(institutionId).stream()
                .filter(p -> p.getAcademicRisk().compareTo(new BigDecimal("0.6")) > 0)
                .toList();
    }

    @Transactional
    public AiStudentProfile analyzeStudent(Long studentId, Long institutionId) {
        BigDecimal grades = calculateGradeAverage(studentId);
        BigDecimal attendance = calculateAttendanceRate(studentId);
        BigDecimal behavior = calculateBehaviorScore(studentId);
        BigDecimal academicRisk = BigDecimal.ONE.subtract(grades).setScale(4, RoundingMode.HALF_UP);
        BigDecimal attendanceRisk = BigDecimal.ONE.subtract(attendance).setScale(4, RoundingMode.HALF_UP);

        AiStudentProfile profile = profileRepository.findByStudentIdAndInstitutionId(studentId, institutionId)
                .orElse(new AiStudentProfile());
        profile.setStudentId(studentId);
        profile.setInstitutionId(institutionId);
        profile.setAcademicRisk(academicRisk);
        profile.setAttendanceRisk(attendanceRisk);
        profile.setBehaviorScore(behavior);
        profile.setEngagementScore(calculateEngagement(grades, attendance, behavior));
        profile.setLearningStyle(determineLearningStyle(grades, attendance));
        profile.setStrengths(determineStrengths(grades, attendance, behavior));
        profile.setWeaknesses(determineWeaknesses(academicRisk, attendanceRisk));
        profile.setRecommendations(generateRecommendations(academicRisk, attendanceRisk, behavior));
        profile.setLastAnalyzed(Instant.now());
        AiStudentProfile saved = profileRepository.save(profile);

        if (academicRisk.compareTo(new BigDecimal("0.7")) > 0) {
            AiAnomaly anomaly = new AiAnomaly();
            anomaly.setInstitutionId(institutionId);
            anomaly.setAnomalyType("RIESGO_ACADEMICO");
            anomaly.setEntityType("ESTUDIANTE");
            anomaly.setEntityId(studentId);
            anomaly.setDescription("Estudiante con riesgo academico alto: " + academicRisk.multiply(new BigDecimal("100")) + "%");
            anomaly.setSeverity("ALTA");
            anomaly.setDetectedValue(grades.toString());
            anomaly.setExpectedRange("0.7 - 1.0");
            anomalyRepository.save(anomaly);
        }

        if (attendanceRisk.compareTo(new BigDecimal("0.5")) > 0) {
            AiAnomaly anomaly = new AiAnomaly();
            anomaly.setInstitutionId(institutionId);
            anomaly.setAnomalyType("RIESGO_ASISTENCIA");
            anomaly.setEntityType("ESTUDIANTE");
            anomaly.setEntityId(studentId);
            anomaly.setDescription("Estudiante con bajo porcentaje de asistencia: " + attendance.multiply(new BigDecimal("100")) + "%");
            anomaly.setSeverity(attendanceRisk.compareTo(new BigDecimal("0.7")) > 0 ? "ALTA" : "MEDIA");
            anomaly.setDetectedValue(attendance.toString());
            anomaly.setExpectedRange("0.85 - 1.0");
            anomalyRepository.save(anomaly);
        }

        return saved;
    }

    private BigDecimal calculateGradeAverage(Long studentId) {
        try {
            return jdbc.queryForObject(
                "SELECT COALESCE(AVG(score)/10.0, 0.5) FROM period_grades WHERE student_id = ?",
                BigDecimal.class, studentId);
        } catch (Exception e) { return new BigDecimal("0.5"); }
    }

    private BigDecimal calculateAttendanceRate(Long studentId) {
        try {
            return jdbc.queryForObject(
                "SELECT CASE WHEN COUNT(*) = 0 THEN 0.85::numeric ELSE (COUNT(CASE WHEN absence_type != 'INASISTENCIA' THEN 1 END)::numeric / COUNT(*)::numeric) END FROM daily_log_student_absences WHERE student_id = ?",
                BigDecimal.class, studentId);
        } catch (Exception e) { return new BigDecimal("0.85"); }
    }

    private BigDecimal calculateBehaviorScore(Long studentId) {
        try {
            Long merits = jdbc.queryForObject("SELECT COUNT(*) FROM student_merits WHERE student_id = ?", Long.class, studentId);
            Long demerits = jdbc.queryForObject("SELECT COUNT(*) FROM student_demerits WHERE student_id = ?", Long.class, studentId);
            long total = (merits != null ? merits : 0) + (demerits != null ? demerits : 0);
            if (total == 0) return new BigDecimal("0.7");
            return BigDecimal.valueOf((merits != null ? merits : 0)).divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP);
        } catch (Exception e) { return new BigDecimal("0.7"); }
    }

    private BigDecimal calculateEngagement(BigDecimal grades, BigDecimal attendance, BigDecimal behavior) {
        return grades.multiply(new BigDecimal("0.4"))
                .add(attendance.multiply(new BigDecimal("0.35")))
                .add(behavior.multiply(new BigDecimal("0.25")))
                .setScale(4, RoundingMode.HALF_UP);
    }

    private String determineLearningStyle(BigDecimal grades, BigDecimal attendance) {
        if (grades.compareTo(new BigDecimal("0.8")) >= 0) return "AVANZADO";
        if (attendance.compareTo(new BigDecimal("0.9")) >= 0) return "CONSTANTE";
        if (grades.compareTo(new BigDecimal("0.5")) < 0) return "NECESITA_APOYO";
        return "EN_DESARROLLO";
    }

    private String determineStrengths(BigDecimal grades, BigDecimal attendance, BigDecimal behavior) {
        StringBuilder s = new StringBuilder();
        if (grades.compareTo(new BigDecimal("0.7")) >= 0) s.append("Buen rendimiento academico. ");
        if (attendance.compareTo(new BigDecimal("0.9")) >= 0) s.append("Excelente asistencia. ");
        if (behavior.compareTo(new BigDecimal("0.7")) >= 0) s.append("Buena conducta. ");
        return s.length() > 0 ? s.toString() : "En proceso de evaluacion";
    }

    private String determineWeaknesses(BigDecimal academicRisk, BigDecimal attendanceRisk) {
        StringBuilder w = new StringBuilder();
        if (academicRisk.compareTo(new BigDecimal("0.5")) > 0) w.append("Riesgo academico. ");
        if (attendanceRisk.compareTo(new BigDecimal("0.3")) > 0) w.append("Asistencia irregular. ");
        return w.length() > 0 ? w.toString() : "Sin debilidades detectadas";
    }

    private String generateRecommendations(BigDecimal academicRisk, BigDecimal attendanceRisk, BigDecimal behavior) {
        StringBuilder r = new StringBuilder();
        if (academicRisk.compareTo(new BigDecimal("0.6")) > 0) r.append("Refuerzo academico recomendado. ");
        if (attendanceRisk.compareTo(new BigDecimal("0.4")) > 0) r.append("Seguimiento de asistencia. ");
        if (behavior.compareTo(new BigDecimal("0.5")) < 0) r.append("Atencion conductual. ");
        if (r.length() == 0) r.append("Mantener nivel actual.");
        return r.toString();
    }

    public List<Long> getAllStudentIds(Long institutionId) {
        try {
            return jdbc.queryForList("SELECT id FROM students WHERE institution_id = ?", Long.class, institutionId);
        } catch (Exception e) { return List.of(); }
    }

    public Map<String, Object> getPredictionStats(Long institutionId) {
        long totalPredictions = predictionRepository.count();
        long positive = jdbc.queryForObject(
            "SELECT COUNT(*) FROM ai_predictions WHERE confidence_score >= 0.7", Long.class);
        long models = modelRepository.findByInstitutionIdOrderByNameAsc(institutionId).size();
        return Map.of("totalPredictions", totalPredictions, "highConfidence", positive, "totalModels", models);
    }

    public Map<String, Object> getInstitutionStats(Long institutionId) {
        long totalStudents = jdbc.queryForObject("SELECT COUNT(*) FROM students", Long.class);
        long highRisk = profileRepository.findByInstitutionIdOrderByAcademicRiskDesc(institutionId).stream()
                .filter(p -> p.getAcademicRisk().compareTo(new BigDecimal("0.6")) > 0).count();
        long anomalies = anomalyRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "DETECTADA").size();
        long recommendations = recommendationRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "PENDIENTE").size();

        List<Map<String, Object>> gradeDist = jdbc.queryForList(
            "SELECT CASE " +
            "WHEN average_score >= 9 THEN '9-10' WHEN average_score >= 7 THEN '7-8' WHEN average_score >= 5 THEN '5-6' " +
            "WHEN average_score >= 3 THEN '3-4' ELSE '0-2' END as grade_range, " +
            "COUNT(*) as count FROM period_grades WHERE average_score IS NOT NULL GROUP BY grade_range ORDER BY grade_range"
        );

        List<Map<String, Object>> styleDist = jdbc.queryForList(
            "SELECT COALESCE(learning_style, 'NO_DETERMINADO') as style, COUNT(*) as count " +
            "FROM ai_student_profiles WHERE institution_id = ? GROUP BY style", institutionId
        );

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("highRiskStudents", highRisk);
        stats.put("activeAnomalies", anomalies);
        stats.put("pendingRecommendations", recommendations);
        stats.put("gradeDistribution", gradeDist);
        stats.put("learningStyles", styleDist);
        return stats;
    }
}
