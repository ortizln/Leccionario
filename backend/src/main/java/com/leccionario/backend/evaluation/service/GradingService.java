package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.evaluation.domain.Evaluation;
import com.leccionario.backend.evaluation.domain.EvaluationType;
import com.leccionario.backend.evaluation.domain.Grade;
import com.leccionario.backend.evaluation.domain.GradeHistory;
import com.leccionario.backend.evaluation.domain.GradeScale;
import com.leccionario.backend.evaluation.domain.PeriodGrade;
import com.leccionario.backend.evaluation.dto.EvaluationRequest;
import com.leccionario.backend.evaluation.dto.EvaluationResponse;
import com.leccionario.backend.evaluation.dto.EvaluationTypeRequest;
import com.leccionario.backend.evaluation.dto.EvaluationTypeResponse;
import com.leccionario.backend.evaluation.dto.GradeGridResponse;
import com.leccionario.backend.evaluation.dto.GradeRequest;
import com.leccionario.backend.evaluation.dto.GradeResponse;
import com.leccionario.backend.evaluation.dto.GradeScaleRequest;
import com.leccionario.backend.evaluation.dto.GradeScaleResponse;
import com.leccionario.backend.evaluation.dto.GradingDashboardResponse;
import com.leccionario.backend.evaluation.dto.PeriodGradeResponse;
import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.evaluation.repository.EvaluationTypeRepository;
import com.leccionario.backend.evaluation.repository.GradeHistoryRepository;
import com.leccionario.backend.evaluation.repository.GradeRepository;
import com.leccionario.backend.evaluation.repository.GradeScaleRepository;
import com.leccionario.backend.evaluation.repository.PeriodGradeRepository;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.lessonplan.domain.LessonPlan;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.repository.StudentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradingService {

    private final GradeScaleRepository gradeScaleRepository;
    private final EvaluationTypeRepository evaluationTypeRepository;
    private final EvaluationRepository evaluationRepository;
    private final GradeRepository gradeRepository;
    private final PeriodGradeRepository periodGradeRepository;
    private final GradeHistoryRepository gradeHistoryRepository;
    private final LessonPlanRepository lessonPlanRepository;
    private final StudentRepository studentRepository;
    private final AuditService auditService;

    // --- Grade Scales ---

    @Transactional
    public GradeScaleResponse createScale(GradeScaleRequest request, Long institutionId, String username) {
        Institution institution = new Institution();
        institution.setId(institutionId);

        GradeScale scale = new GradeScale();
        scale.setInstitution(institution);
        scale.setName(request.getName());
        scale.setScaleType(request.getScaleType());
        scale.setMinValue(request.getMinValue());
        scale.setMaxValue(request.getMaxValue());
        scale.setPassValue(request.getPassValue());
        scale.setIsDefault(request.getIsDefault());
        scale.setActive(true);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            gradeScaleRepository.findByInstitutionIdAndIsDefaultTrue(institutionId)
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        gradeScaleRepository.save(existing);
                    });
        }

        GradeScale saved = gradeScaleRepository.save(scale);
        auditService.log(username, "CREATE", "GRADE_SCALE", "Escala: " + saved.getName());
        return toScaleResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GradeScaleResponse> getScalesByInstitution(Long institutionId) {
        return gradeScaleRepository.findByInstitutionIdAndActiveTrue(institutionId)
                .stream().map(this::toScaleResponse).toList();
    }

    @Transactional
    public GradeScaleResponse updateScale(Long id, GradeScaleRequest request, Long institutionId, String username) {
        GradeScale scale = gradeScaleRepository.findById(id)
                .filter(s -> s.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new ResourceNotFoundException("Escala no encontrada"));

        scale.setName(request.getName());
        scale.setScaleType(request.getScaleType());
        scale.setMinValue(request.getMinValue());
        scale.setMaxValue(request.getMaxValue());
        scale.setPassValue(request.getPassValue());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            gradeScaleRepository.findByInstitutionIdAndIsDefaultTrue(institutionId)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            existing.setIsDefault(false);
                            gradeScaleRepository.save(existing);
                        }
                    });
            scale.setIsDefault(true);
        }

        GradeScale saved = gradeScaleRepository.save(scale);
        auditService.log(username, "UPDATE", "GRADE_SCALE", "Escala: " + saved.getName());
        return toScaleResponse(saved);
    }

    @Transactional
    public void deleteScale(Long id, Long institutionId, String username) {
        GradeScale scale = gradeScaleRepository.findById(id)
                .filter(s -> s.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new ResourceNotFoundException("Escala no encontrada"));
        scale.setActive(false);
        gradeScaleRepository.save(scale);
        auditService.log(username, "DELETE", "GRADE_SCALE", "Escala: " + scale.getName());
    }

    // --- Evaluation Types ---

    @Transactional
    public EvaluationTypeResponse createEvaluationType(EvaluationTypeRequest request, Long institutionId, String username) {
        Institution institution = new Institution();
        institution.setId(institutionId);

        EvaluationType evalType = new EvaluationType();
        evalType.setInstitution(institution);
        evalType.setName(request.getName());
        evalType.setCode(request.getCode());
        evalType.setDescription(request.getDescription());
        evalType.setWeightPct(request.getWeightPct());
        evalType.setActive(true);

        EvaluationType saved = evaluationTypeRepository.save(evalType);
        auditService.log(username, "CREATE", "EVALUATION_TYPE", "Tipo: " + saved.getName());
        return toEvalTypeResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EvaluationTypeResponse> getEvaluationTypesByInstitution(Long institutionId) {
        return evaluationTypeRepository.findByInstitutionIdAndActiveTrue(institutionId)
                .stream().map(this::toEvalTypeResponse).toList();
    }

    @Transactional
    public EvaluationTypeResponse updateEvaluationType(Long id, EvaluationTypeRequest request, Long institutionId, String username) {
        EvaluationType evalType = evaluationTypeRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de evaluacion no encontrado"));

        evalType.setName(request.getName());
        evalType.setCode(request.getCode());
        evalType.setDescription(request.getDescription());
        evalType.setWeightPct(request.getWeightPct());

        EvaluationType saved = evaluationTypeRepository.save(evalType);
        auditService.log(username, "UPDATE", "EVALUATION_TYPE", "Tipo: " + saved.getName());
        return toEvalTypeResponse(saved);
    }

    @Transactional
    public void deleteEvaluationType(Long id, Long institutionId, String username) {
        EvaluationType evalType = evaluationTypeRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de evaluacion no encontrado"));
        evalType.setActive(false);
        evaluationTypeRepository.save(evalType);
        auditService.log(username, "DELETE", "EVALUATION_TYPE", "Tipo: " + evalType.getName());
    }

    // --- Evaluations ---

    @Transactional
    public EvaluationResponse createEvaluation(EvaluationRequest request, String username) {
        LessonPlan lessonPlan = lessonPlanRepository.findById(request.getLessonPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson plan no encontrado"));

        Evaluation evaluation = new Evaluation();
        evaluation.setLessonPlan(lessonPlan);

        if (request.getEvaluationTypeId() != null) {
            EvaluationType evalType = evaluationTypeRepository.findById(request.getEvaluationTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de evaluacion no encontrado"));
            evaluation.setEvaluationType(evalType.getName());
        } else if (request.getEvaluationType() != null) {
            evaluation.setEvaluationType(request.getEvaluationType());
        }

        evaluation.setEvaluationDate(request.getEvaluationDate());
        evaluation.setWeight(request.getWeight() != null ? request.getWeight() : BigDecimal.ONE);
        evaluation.setMaxScore(request.getMaxScore() != null ? request.getMaxScore() : BigDecimal.TEN);
        evaluation.setScore(BigDecimal.ZERO);

        Evaluation saved = evaluationRepository.save(evaluation);
        auditService.log(username, "CREATE", "EVALUATION", "Evaluacion #" + saved.getId());
        return toEvalResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getEvaluationsByLessonPlan(Long lessonPlanId) {
        return evaluationRepository.findByLessonPlanId(lessonPlanId)
                .stream().map(this::toEvalResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> getEvaluationsByCourseAndSubject(Long courseId, Long subjectId) {
        return evaluationRepository.findByLessonPlanCourseIdAndLessonPlanSubjectId(courseId, subjectId)
                .stream().map(this::toEvalResponse).toList();
    }

    // --- Grades ---

    @Transactional
    public GradeResponse saveGrade(GradeRequest request, String username) {
        Evaluation evaluation = evaluationRepository.findById(request.getEvaluationId())
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion no encontrada"));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));

        Grade grade = gradeRepository.findByEvaluationIdAndStudentId(request.getEvaluationId(), request.getStudentId())
                .orElse(new Grade());

        BigDecimal oldScore = grade.getScore();

        grade.setEvaluation(evaluation);
        grade.setStudent(student);
        grade.setScore(request.getScore());
        grade.setComment(request.getComment());
        grade.setGradedBy(username);

        Grade saved = gradeRepository.save(grade);

        if (oldScore != null && oldScore.compareTo(saved.getScore()) != 0) {
            GradeHistory history = new GradeHistory();
            history.setGrade(saved);
            history.setOldScore(oldScore);
            history.setNewScore(saved.getScore());
            history.setChangedBy(username);
            history.setReason(request.getReason());
            gradeHistoryRepository.save(history);
        }

        auditService.log(username, "SAVE_GRADE", "GRADE",
                "Estudiante #" + student.getId() + " Evaluacion #" + evaluation.getId() + " Score: " + saved.getScore());

        recalculatePeriodGrade(student.getId(),
                evaluation.getLessonPlan().getCourse().getId(),
                evaluation.getLessonPlan().getSubject().getId(),
                evaluation.getLessonPlan().getPeriod().getId());

        return toGradeResponse(saved);
    }

    @Transactional
    public List<GradeResponse> saveBulkGrades(List<GradeRequest> requests, String username) {
        List<GradeResponse> results = new ArrayList<>();
        for (GradeRequest request : requests) {
            results.add(saveGrade(request, username));
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<GradeResponse> getGradesByEvaluation(Long evaluationId) {
        return gradeRepository.findByEvaluationId(evaluationId)
                .stream().map(this::toGradeResponse).toList();
    }

    // --- Grade Grid ---

    @Transactional(readOnly = true)
    public GradeGridResponse getGradeGrid(Long courseId, Long subjectId, Long periodId) {
        List<Evaluation> evaluations = evaluationRepository
                .findByLessonPlanCourseIdAndLessonPlanSubjectIdAndLessonPlanPeriodId(courseId, subjectId, periodId);

        List<Student> students = studentRepository.findByCourseId(courseId);

        List<LessonPlan> lessonPlans = lessonPlanRepository
                .findByCourseIdAndSubjectIdAndPeriodId(courseId, subjectId, periodId);

        GradeGridResponse grid = new GradeGridResponse();
        grid.setCourseId(courseId);
        grid.setSubjectId(subjectId);
        grid.setAcademicPeriodId(periodId);

        if (!lessonPlans.isEmpty()) {
            LessonPlan first = lessonPlans.get(0);
            grid.setCourseName(first.getCourse().getName());
            grid.setSubjectName(first.getSubject().getName());
            grid.setAcademicPeriodName(first.getPeriod().getName());
        }

        List<GradeGridResponse.EvaluationHeader> headers = evaluations.stream()
                .map(e -> new GradeGridResponse.EvaluationHeader(
                        e.getId(),
                        e.getEvaluationType(),
                        e.getEvaluationType(),
                        e.getWeight(),
                        e.getMaxScore(),
                        e.getEvaluationDate()))
                .toList();
        grid.setEvaluations(headers);

        List<GradeGridResponse.StudentGradeRow> rows = new ArrayList<>();
        for (Student student : students) {
            GradeGridResponse.StudentGradeRow row = new GradeGridResponse.StudentGradeRow();
            row.setStudentId(student.getId());
            row.setStudentName(student.getUser().getFirstName() + " " + student.getUser().getLastName());
            row.setEnrollmentNumber(student.getEnrollmentNumber());

            List<BigDecimal> scores = new ArrayList<>();
            BigDecimal weightedSum = BigDecimal.ZERO;
            BigDecimal totalWeight = BigDecimal.ZERO;

            for (Evaluation eval : evaluations) {
                Grade grade = gradeRepository.findByEvaluationIdAndStudentId(eval.getId(), student.getId()).orElse(null);
                BigDecimal score = grade != null ? grade.getScore() : null;
                scores.add(score);

                if (score != null && eval.getWeight() != null) {
                    weightedSum = weightedSum.add(score.multiply(eval.getWeight()));
                    totalWeight = totalWeight.add(eval.getWeight());
                }
            }

            row.setScores(scores);
            if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                row.setAverage(weightedSum.divide(totalWeight, 2, RoundingMode.HALF_UP));
            }
            row.setStatus(row.getAverage() != null ? "CALCULATED" : "PENDING");
            rows.add(row);
        }
        grid.setStudents(rows);

        return grid;
    }

    // --- Period Grades ---

    @Transactional
    public void recalculatePeriodGrade(Long studentId, Long courseId, Long subjectId, Long periodId) {
        List<Grade> grades = gradeRepository.findByStudentAndSubjectAndPeriod(studentId, subjectId, periodId);

        PeriodGrade periodGrade = periodGradeRepository
                .findByStudentIdAndCourseIdAndSubjectIdAndAcademicPeriodId(studentId, courseId, subjectId, periodId)
                .orElse(new PeriodGrade());

        Student student = studentRepository.findById(studentId).orElse(null);
        com.leccionario.backend.academic.domain.Course course = new com.leccionario.backend.academic.domain.Course();
        course.setId(courseId);
        com.leccionario.backend.academic.domain.Subject subject = new com.leccionario.backend.academic.domain.Subject();
        subject.setId(subjectId);
        com.leccionario.backend.academic.domain.AcademicPeriod period = new com.leccionario.backend.academic.domain.AcademicPeriod();
        period.setId(periodId);

        periodGrade.setStudent(student);
        periodGrade.setCourse(course);
        periodGrade.setSubject(subject);
        periodGrade.setAcademicPeriod(period);

        if (!grades.isEmpty()) {
            BigDecimal weightedSum = BigDecimal.ZERO;
            BigDecimal totalWeight = BigDecimal.ZERO;

            for (Grade grade : grades) {
                Evaluation eval = grade.getEvaluation();
                BigDecimal weight = eval.getWeight() != null ? eval.getWeight() : BigDecimal.ONE;
                weightedSum = weightedSum.add(grade.getScore().multiply(weight));
                totalWeight = totalWeight.add(weight);
            }

            BigDecimal average = totalWeight.compareTo(BigDecimal.ZERO) > 0
                    ? weightedSum.divide(totalWeight, 2, RoundingMode.HALF_UP)
                    : null;

            periodGrade.setAverageScore(average);
            periodGrade.setCalculatedAt(OffsetDateTime.now());

            if (average != null) {
                GradeScale defaultScale = gradeScaleRepository.findByInstitutionIdAndIsDefaultTrue(
                        student != null ? 1L : 1L).orElse(null);
                BigDecimal passValue = defaultScale != null ? defaultScale.getPassValue() : BigDecimal.valueOf(7);
                periodGrade.setStatus(average.compareTo(passValue) >= 0 ? "APPROVED" : "FAILED");
            } else {
                periodGrade.setStatus("PENDING");
            }
        } else {
            periodGrade.setAverageScore(null);
            periodGrade.setStatus("PENDING");
        }

        periodGradeRepository.save(periodGrade);
    }

    @Transactional(readOnly = true)
    public List<PeriodGradeResponse> getPeriodGrades(Long courseId, Long periodId) {
        return periodGradeRepository.findByCourseAndPeriod(courseId, periodId)
                .stream().map(this::toPeriodGradeResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PeriodGradeResponse> getStudentPeriodGrades(Long studentId, Long periodId) {
        return periodGradeRepository.findByStudentIdAndAcademicPeriodId(studentId, periodId)
                .stream().map(this::toPeriodGradeResponse).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGradeStatistics(Long courseId, Long subjectId, Long periodId) {
        List<PeriodGrade> periodGrades = periodGradeRepository.findByCourseAndPeriod(courseId, periodId);

        List<PeriodGrade> filtered = periodGrades.stream()
                .filter(pg -> pg.getSubject().getId().equals(subjectId))
                .toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        if (filtered.isEmpty()) {
            stats.put("count", 0);
            stats.put("average", null);
            stats.put("highest", null);
            stats.put("lowest", null);
            stats.put("approved", 0);
            stats.put("failed", 0);
            return stats;
        }

        List<BigDecimal> scores = filtered.stream()
                .map(PeriodGrade::getAverageScore)
                .filter(s -> s != null)
                .toList();

        stats.put("count", filtered.size());
        stats.put("average", scores.stream()
                .reduce(BigDecimal::add)
                .map(b -> b.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP))
                .orElse(null));
        stats.put("highest", scores.stream().max(BigDecimal::compareTo).orElse(null));
        stats.put("lowest", scores.stream().min(BigDecimal::compareTo).orElse(null));
        stats.put("approved", filtered.stream().filter(pg -> "APPROVED".equals(pg.getStatus())).count());
        stats.put("failed", filtered.stream().filter(pg -> "FAILED".equals(pg.getStatus())).count());
        return stats;
    }

    @Transactional(readOnly = true)
    public GradingDashboardResponse getDashboard(Long periodId) {
        List<PeriodGrade> allGrades = periodGradeRepository.findAll().stream()
                .filter(pg -> pg.getAcademicPeriod().getId().equals(periodId))
                .toList();

        GradingDashboardResponse dashboard = new GradingDashboardResponse();
        dashboard.setPeriodId(periodId);

        if (allGrades.isEmpty()) {
            dashboard.setTotalStudents(0);
            dashboard.setTotalEvaluations(evaluationRepository.count());
            dashboard.setTotalGrades(0);
            dashboard.setOverallAverage(null);
            dashboard.setApprovedCount(0);
            dashboard.setFailedCount(0);
            dashboard.setPendingCount(0);
            dashboard.setApprovalRate(BigDecimal.ZERO);
            dashboard.setCourseStats(List.of());
            dashboard.setTopStudents(List.of());
            dashboard.setBottomStudents(List.of());
            dashboard.setDistribution(List.of());
            return dashboard;
        }

        long totalStudents = allGrades.stream().map(pg -> pg.getStudent().getId()).distinct().count();
        long totalEvaluations = evaluationRepository.count();
        long totalGrades = gradeRepository.count();

        List<BigDecimal> scores = allGrades.stream()
                .map(PeriodGrade::getAverageScore)
                .filter(s -> s != null)
                .toList();

        BigDecimal overallAvg = scores.isEmpty() ? null : scores.stream()
                .reduce(BigDecimal::add)
                .map(b -> b.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP))
                .orElse(null);

        long approved = allGrades.stream().filter(pg -> "APPROVED".equals(pg.getStatus())).count();
        long failed = allGrades.stream().filter(pg -> "FAILED".equals(pg.getStatus())).count();
        long pending = allGrades.stream().filter(pg -> "PENDING".equals(pg.getStatus())).count();
        long totalDecided = approved + failed;
        BigDecimal approvalRate = totalDecided > 0
                ? BigDecimal.valueOf(approved).multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalDecided), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        dashboard.setTotalStudents(totalStudents);
        dashboard.setTotalEvaluations(totalEvaluations);
        dashboard.setTotalGrades(totalGrades);
        dashboard.setOverallAverage(overallAvg);
        dashboard.setApprovedCount(approved);
        dashboard.setFailedCount(failed);
        dashboard.setPendingCount(pending);
        dashboard.setApprovalRate(approvalRate);

        // Per-course stats
        Map<Long, List<PeriodGrade>> byCourse = new LinkedHashMap<>();
        for (PeriodGrade pg : allGrades) {
            byCourse.computeIfAbsent(pg.getCourse().getId(), k -> new ArrayList<>()).add(pg);
        }
        List<GradingDashboardResponse.CourseStats> courseStats = new ArrayList<>();
        for (var entry : byCourse.entrySet()) {
            List<PeriodGrade> courseGrades = entry.getValue();
            String courseName = courseGrades.get(0).getCourse().getName();
            long courseStudents = courseGrades.stream().map(pg -> pg.getStudent().getId()).distinct().count();
            List<BigDecimal> courseScores = courseGrades.stream()
                    .map(PeriodGrade::getAverageScore).filter(s -> s != null).toList();
            BigDecimal courseAvg = courseScores.isEmpty() ? null : courseScores.stream()
                    .reduce(BigDecimal::add)
                    .map(b -> b.divide(BigDecimal.valueOf(courseScores.size()), 2, RoundingMode.HALF_UP))
                    .orElse(null);
            long courseApproved = courseGrades.stream().filter(pg -> "APPROVED".equals(pg.getStatus())).count();
            long courseFailed = courseGrades.stream().filter(pg -> "FAILED".equals(pg.getStatus())).count();
            courseStats.add(new GradingDashboardResponse.CourseStats(
                    entry.getKey(), courseName, courseStudents, courseAvg, courseApproved, courseFailed));
        }
        dashboard.setCourseStats(courseStats);

        // Top 5 students
        Map<Long, GradingDashboardResponse.StudentRanking> studentMap = new LinkedHashMap<>();
        for (PeriodGrade pg : allGrades) {
            Long studentId = pg.getStudent().getId();
            studentMap.computeIfAbsent(studentId, k -> {
                String name = pg.getStudent().getUser().getFirstName() + " " + pg.getStudent().getUser().getLastName();
                return new GradingDashboardResponse.StudentRanking(k, name, pg.getCourse().getName(), BigDecimal.ZERO, 0, 0);
            });
            GradingDashboardResponse.StudentRanking ranking = studentMap.get(studentId);
            ranking.setTotalSubjects(ranking.getTotalSubjects() + 1);
            if ("APPROVED".equals(pg.getStatus())) {
                ranking.setApprovedSubjects(ranking.getApprovedSubjects() + 1);
            }
        }

        // Calculate averages per student
        for (GradingDashboardResponse.StudentRanking ranking : studentMap.values()) {
            List<BigDecimal> studentScores = allGrades.stream()
                    .filter(pg -> pg.getStudent().getId().equals(ranking.getStudentId()))
                    .map(PeriodGrade::getAverageScore)
                    .filter(s -> s != null)
                    .toList();
            if (!studentScores.isEmpty()) {
                BigDecimal avg = studentScores.stream().reduce(BigDecimal::add)
                        .map(b -> b.divide(BigDecimal.valueOf(studentScores.size()), 2, RoundingMode.HALF_UP))
                        .orElse(BigDecimal.ZERO);
                ranking.setAverage(avg);
            }
        }

        List<GradingDashboardResponse.StudentRanking> ranked = studentMap.values().stream()
                .sorted((a, b) -> {
                    int cmp = Boolean.compare(b.getAverage() == null, a.getAverage() == null);
                    if (cmp != 0) return cmp;
                    return a.getAverage().compareTo(b.getAverage());
                })
                .toList();

        dashboard.setTopStudents(ranked.stream().limit(5).toList());
        dashboard.setBottomStudents(ranked.stream().skip(Math.max(0, ranked.size() - 5)).toList());

        // Distribution buckets
        long b1 = scores.stream().filter(s -> s.compareTo(BigDecimal.valueOf(0)) >= 0 && s.compareTo(BigDecimal.valueOf(4)) < 0).count();
        long b2 = scores.stream().filter(s -> s.compareTo(BigDecimal.valueOf(4)) >= 0 && s.compareTo(BigDecimal.valueOf(6)) < 0).count();
        long b3 = scores.stream().filter(s -> s.compareTo(BigDecimal.valueOf(6)) >= 0 && s.compareTo(BigDecimal.valueOf(7)) < 0).count();
        long b4 = scores.stream().filter(s -> s.compareTo(BigDecimal.valueOf(7)) >= 0 && s.compareTo(BigDecimal.valueOf(8)) < 0).count();
        long b5 = scores.stream().filter(s -> s.compareTo(BigDecimal.valueOf(8)) >= 0 && s.compareTo(BigDecimal.valueOf(9)) < 0).count();
        long b6 = scores.stream().filter(s -> s.compareTo(BigDecimal.valueOf(9)) >= 0).count();
        List<GradingDashboardResponse.DistributionBucket> dist = List.of(
                new GradingDashboardResponse.DistributionBucket("0-3.99", b1),
                new GradingDashboardResponse.DistributionBucket("4-5.99", b2),
                new GradingDashboardResponse.DistributionBucket("6-6.99", b3),
                new GradingDashboardResponse.DistributionBucket("7-7.99", b4),
                new GradingDashboardResponse.DistributionBucket("8-8.99", b5),
                new GradingDashboardResponse.DistributionBucket("9-10", b6));
        dashboard.setDistribution(dist);

        return dashboard;
    }

    // --- Mappers ---

    private GradeScaleResponse toScaleResponse(GradeScale s) {
        GradeScaleResponse r = new GradeScaleResponse();
        r.setId(s.getId());
        r.setInstitutionId(s.getInstitution().getId());
        r.setName(s.getName());
        r.setScaleType(s.getScaleType());
        r.setMinValue(s.getMinValue());
        r.setMaxValue(s.getMaxValue());
        r.setPassValue(s.getPassValue());
        r.setIsDefault(s.getIsDefault());
        r.setActive(s.getActive());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }

    private EvaluationTypeResponse toEvalTypeResponse(EvaluationType e) {
        EvaluationTypeResponse r = new EvaluationTypeResponse();
        r.setId(e.getId());
        r.setInstitutionId(e.getInstitution().getId());
        r.setName(e.getName());
        r.setCode(e.getCode());
        r.setDescription(e.getDescription());
        r.setWeightPct(e.getWeightPct());
        r.setActive(e.getActive());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    private EvaluationResponse toEvalResponse(Evaluation e) {
        EvaluationResponse r = new EvaluationResponse();
        r.setId(e.getId());
        r.setLessonPlanId(e.getLessonPlan().getId());
        r.setStudentId(null);
        r.setEvaluationType(e.getEvaluationType());
        r.setEvaluationDate(e.getEvaluationDate());
        r.setWeight(e.getWeight());
        r.setMaxScore(e.getMaxScore());
        r.setCourseName(e.getLessonPlan().getCourse().getName());
        r.setSubjectName(e.getLessonPlan().getSubject().getName());
        r.setTeacherName(e.getLessonPlan().getTeacher().getUser().getFirstName() + " " + e.getLessonPlan().getTeacher().getUser().getLastName());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    private GradeResponse toGradeResponse(Grade g) {
        GradeResponse r = new GradeResponse();
        r.setId(g.getId());
        r.setEvaluationId(g.getEvaluation().getId());
        r.setStudentId(g.getStudent().getId());
        r.setStudentName(g.getStudent().getUser().getFirstName() + " " + g.getStudent().getUser().getLastName());
        r.setScore(g.getScore());
        r.setComment(g.getComment());
        r.setGradedBy(g.getGradedBy());
        r.setGradedAt(g.getGradedAt());
        r.setCreatedAt(g.getCreatedAt());
        return r;
    }

    private PeriodGradeResponse toPeriodGradeResponse(PeriodGrade pg) {
        PeriodGradeResponse r = new PeriodGradeResponse();
        r.setId(pg.getId());
        r.setStudentId(pg.getStudent().getId());
        r.setStudentName(pg.getStudent().getUser().getFirstName() + " " + pg.getStudent().getUser().getLastName());
        r.setCourseId(pg.getCourse().getId());
        r.setCourseName(pg.getCourse().getName());
        r.setSubjectId(pg.getSubject().getId());
        r.setSubjectName(pg.getSubject().getName());
        r.setAcademicPeriodId(pg.getAcademicPeriod().getId());
        r.setAcademicPeriodName(pg.getAcademicPeriod().getName());
        r.setAverageScore(pg.getAverageScore());
        r.setStatus(pg.getStatus());
        r.setTeacherNotes(pg.getTeacherNotes());
        return r;
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getGradesByStudent(Long studentId) {
        return periodGradeRepository.findByStudentIdAllPeriods(studentId).stream()
                .map(pg -> {
                    java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", pg.getId());
                    m.put("studentId", pg.getStudent().getId());
                    m.put("studentName", pg.getStudent().getUser().getFirstName() + " " + pg.getStudent().getUser().getLastName());
                    m.put("courseId", pg.getCourse().getId());
                    m.put("courseName", pg.getCourse().getName());
                    m.put("subjectId", pg.getSubject().getId());
                    m.put("subjectName", pg.getSubject().getName());
                    m.put("academicPeriodId", pg.getAcademicPeriod().getId());
                    m.put("academicPeriodName", pg.getAcademicPeriod().getName());
                    m.put("averageScore", pg.getAverageScore());
                    m.put("score", pg.getAverageScore());
                    m.put("status", pg.getStatus());
                    m.put("teacherNotes", pg.getTeacherNotes());
                    return m;
                })
                .toList();
    }
}
