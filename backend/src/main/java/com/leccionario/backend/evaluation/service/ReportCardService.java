package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.evaluation.domain.PeriodGrade;
import com.leccionario.backend.evaluation.domain.ReportCard;
import com.leccionario.backend.evaluation.domain.ReportCardDetail;
import com.leccionario.backend.evaluation.dto.AcademicHistoryResponse;
import com.leccionario.backend.evaluation.dto.ReportCardDetailResponse;
import com.leccionario.backend.evaluation.dto.ReportCardRequest;
import com.leccionario.backend.evaluation.dto.ReportCardResponse;
import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.evaluation.repository.PeriodGradeRepository;
import com.leccionario.backend.evaluation.repository.ReportCardDetailRepository;
import com.leccionario.backend.evaluation.repository.ReportCardRepository;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
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
public class ReportCardService {

    private final ReportCardRepository reportCardRepository;
    private final ReportCardDetailRepository reportCardDetailRepository;
    private final PeriodGradeRepository periodGradeRepository;
    private final EvaluationRepository evaluationRepository;
    private final StudentRepository studentRepository;
    private final LessonPlanRepository lessonPlanRepository;

    @Transactional
    public ReportCardResponse generateReportCard(ReportCardRequest request, String username) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        ReportCard existing = reportCardRepository
                .findByStudentIdAndCourseIdAndAcademicPeriodId(
                        request.getStudentId(), request.getCourseId(), request.getAcademicPeriodId())
                .orElse(null);

        ReportCard rc;
        if (existing != null) {
            rc = existing;
        } else {
            rc = new ReportCard();
            rc.setStudent(student);
            Course course = new Course();
            course.setId(request.getCourseId());
            rc.setCourse(course);
            AcademicPeriod period = new AcademicPeriod();
            period.setId(request.getAcademicPeriodId());
            rc.setAcademicPeriod(period);
            rc.setGeneratedBy(username);
        }

        rc.setTeacherComments(request.getTeacherComments());
        rc.setConductNotes(request.getConductNotes());
        rc.setObservations(request.getObservations());

        List<PeriodGrade> periodGrades = periodGradeRepository.findByStudentIdAndAcademicPeriodId(
                request.getStudentId(), request.getAcademicPeriodId());

        List<PeriodGrade> courseGrades = periodGrades.stream()
                .filter(pg -> pg.getCourse().getId().equals(request.getCourseId()))
                .toList();

        List<ReportCardDetail> details = new ArrayList<>();
        for (PeriodGrade pg : courseGrades) {
            ReportCardDetail detail = new ReportCardDetail();
            detail.setReportCard(rc);
            detail.setSubject(pg.getSubject());
            Teacher teacher = findTeacherForSubject(pg.getSubject().getId(), request.getCourseId(), request.getAcademicPeriodId());
            if (teacher != null) {
                detail.setTeacher(teacher);
            }
            detail.setAverageScore(pg.getAverageScore());
            detail.setStatus(pg.getStatus());
            detail.setTeacherComment(pg.getTeacherNotes());
            int evalCount = evaluationRepository.findByLessonPlanCourseIdAndLessonPlanSubjectIdAndLessonPlanPeriodId(
                    request.getCourseId(), pg.getSubject().getId(), request.getAcademicPeriodId()).size();
            detail.setEvaluationCount(evalCount);
            details.add(detail);
        }

        List<BigDecimal> scores = courseGrades.stream()
                .map(PeriodGrade::getAverageScore)
                .filter(s -> s != null)
                .toList();
        BigDecimal avg = scores.isEmpty() ? null : scores.stream()
                .reduce(BigDecimal::add)
                .map(b -> b.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP))
                .orElse(null);
        rc.setOverallAverage(avg);

        long approved = courseGrades.stream().filter(pg -> "APPROVED".equals(pg.getStatus())).count();
        long failed = courseGrades.stream().filter(pg -> "FAILED".equals(pg.getStatus())).count();
        long total = approved + failed;
        if (total > 0) {
            rc.setFinalStatus(approved > failed ? "APPROVED" : "FAILED");
        } else {
            rc.setFinalStatus("PENDING");
        }

        ReportCard saved = reportCardRepository.save(rc);
        reportCardDetailRepository.deleteByReportCardId(saved.getId());
        for (ReportCardDetail d : details) {
            d.setReportCard(saved);
            reportCardDetailRepository.save(d);
        }

        return toReportCardResponse(saved, details);
    }

    private Teacher findTeacherForSubject(Long subjectId, Long courseId, Long periodId) {
        return lessonPlanRepository.findByCourseIdAndSubjectIdAndPeriodId(courseId, subjectId, periodId)
                .stream()
                .findFirst()
                .map(com.leccionario.backend.lessonplan.domain.LessonPlan::getTeacher)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ReportCardResponse getReportCard(Long studentId, Long courseId, Long periodId) {
        ReportCard rc = reportCardRepository
                .findByStudentIdAndCourseIdAndAcademicPeriodId(studentId, courseId, periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Report card not found"));
        List<ReportCardDetail> details = reportCardDetailRepository.findByReportCardId(rc.getId());
        return toReportCardResponse(rc, details);
    }

    @Transactional(readOnly = true)
    public List<ReportCardResponse> getReportCardsByPeriod(Long periodId) {
        return reportCardRepository.findByAcademicPeriodId(periodId)
                .stream()
                .map(rc -> {
                    List<ReportCardDetail> details = reportCardDetailRepository.findByReportCardId(rc.getId());
                    return toReportCardResponse(rc, details);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportCardResponse> getReportCardsByCourseAndPeriod(Long courseId, Long periodId) {
        return reportCardRepository.findByCourseIdAndAcademicPeriodId(courseId, periodId)
                .stream()
                .map(rc -> {
                    List<ReportCardDetail> details = reportCardDetailRepository.findByReportCardId(rc.getId());
                    return toReportCardResponse(rc, details);
                })
                .toList();
    }

    @Transactional
    public ReportCardResponse updateStatus(Long reportCardId, String newStatus, String username) {
        ReportCard rc = reportCardRepository.findById(reportCardId)
                .orElseThrow(() -> new ResourceNotFoundException("Report card not found"));
        rc.setStatus(newStatus);
        switch (newStatus) {
            case "SIGNED" -> rc.setSignedAt(OffsetDateTime.now());
            case "DELIVERED" -> rc.setDeliveredAt(OffsetDateTime.now());
            default -> {}
        }
        ReportCard saved = reportCardRepository.save(rc);
        List<ReportCardDetail> details = reportCardDetailRepository.findByReportCardId(saved.getId());
        return toReportCardResponse(saved, details);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReportCardStats(Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = reportCardRepository.findByAcademicPeriodId(periodId).size();
        long finalized = reportCardRepository.countFinalizedByPeriod(periodId);
        stats.put("total", total);
        stats.put("finalized", finalized);
        stats.put("pending", total - finalized);
        return stats;
    }

    // --- Academic History ---

    @Transactional(readOnly = true)
    public AcademicHistoryResponse getAcademicHistory(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<PeriodGrade> allGrades = periodGradeRepository.findByStudentIdAllPeriods(studentId);

        AcademicHistoryResponse response = new AcademicHistoryResponse();
        response.setStudentId(studentId);
        response.setStudentName(student.getUser().getFirstName() + " " + student.getUser().getLastName());
        response.setEnrollmentNumber(student.getEnrollmentNumber());

        Map<Long, AcademicHistoryResponse.PeriodSummary> periodMap = new LinkedHashMap<>();
        for (PeriodGrade pg : allGrades) {
            Long periodId = pg.getAcademicPeriod().getId();
            periodMap.computeIfAbsent(periodId, k -> new AcademicHistoryResponse.PeriodSummary(
                    k,
                    pg.getAcademicPeriod().getName(),
                    pg.getAcademicPeriod().getStartDate(),
                    pg.getAcademicPeriod().getEndDate()
            ));
            AcademicHistoryResponse.PeriodSummary summary = periodMap.get(periodId);
            summary.getSubjects().add(new AcademicHistoryResponse.SubjectGrade(
                    pg.getSubject().getId(),
                    pg.getSubject().getName(),
                    pg.getTeacherNotes(),
                    pg.getAverageScore(),
                    pg.getStatus()
            ));
        }

        for (AcademicHistoryResponse.PeriodSummary summary : periodMap.values()) {
            List<BigDecimal> scores = summary.getSubjects().stream()
                    .map(AcademicHistoryResponse.SubjectGrade::getAverageScore)
                    .filter(s -> s != null)
                    .toList();
            if (!scores.isEmpty()) {
                summary.setPeriodAverage(scores.stream()
                        .reduce(BigDecimal::add)
                        .map(b -> b.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP))
                        .orElse(null));
                long approved = summary.getSubjects().stream().filter(s -> "APPROVED".equals(s.getStatus())).count();
                long failed = summary.getSubjects().stream().filter(s -> "FAILED".equals(s.getStatus())).count();
                summary.setPeriodStatus(approved > failed ? "APPROVED" : "FAILED");
            } else {
                summary.setPeriodStatus("PENDING");
            }
        }

        response.setPeriods(new ArrayList<>(periodMap.values()));
        return response;
    }

    // --- Mappers ---

    private ReportCardResponse toReportCardResponse(ReportCard rc, List<ReportCardDetail> details) {
        ReportCardResponse r = new ReportCardResponse();
        r.setId(rc.getId());
        r.setStudentId(rc.getStudent().getId());
        r.setStudentName(rc.getStudent().getUser().getFirstName() + " " + rc.getStudent().getUser().getLastName());
        r.setEnrollmentNumber(rc.getStudent().getEnrollmentNumber());
        r.setCourseId(rc.getCourse().getId());
        r.setCourseName(rc.getCourse().getName());
        r.setAcademicPeriodId(rc.getAcademicPeriod().getId());
        r.setAcademicPeriodName(rc.getAcademicPeriod().getName());
        r.setStatus(rc.getStatus());
        r.setOverallAverage(rc.getOverallAverage());
        r.setFinalStatus(rc.getFinalStatus());
        r.setTeacherComments(rc.getTeacherComments());
        r.setConductNotes(rc.getConductNotes());
        r.setAttendanceSummary(rc.getAttendanceSummary());
        r.setObservations(rc.getObservations());
        r.setGeneratedBy(rc.getGeneratedBy());
        r.setGeneratedAt(rc.getGeneratedAt());
        r.setSignedAt(rc.getSignedAt());
        r.setDeliveredAt(rc.getDeliveredAt());
        r.setDetails(details.stream().map(this::toDetailResponse).toList());
        return r;
    }

    private ReportCardDetailResponse toDetailResponse(ReportCardDetail d) {
        ReportCardDetailResponse r = new ReportCardDetailResponse();
        r.setId(d.getId());
        r.setSubjectId(d.getSubject().getId());
        r.setSubjectName(d.getSubject().getName());
        if (d.getTeacher() != null) {
            r.setTeacherId(d.getTeacher().getId());
            r.setTeacherName(d.getTeacher().getUser().getFirstName() + " " + d.getTeacher().getUser().getLastName());
        }
        r.setAverageScore(d.getAverageScore());
        r.setStatus(d.getStatus());
        r.setTeacherComment(d.getTeacherComment());
        r.setEvaluationCount(d.getEvaluationCount());
        return r;
    }
}
