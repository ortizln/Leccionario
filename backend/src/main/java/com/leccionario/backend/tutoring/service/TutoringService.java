package com.leccionario.backend.tutoring.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.tutoring.domain.TutoringFollowUp;
import com.leccionario.backend.tutoring.domain.TutoringSession;
import com.leccionario.backend.tutoring.dto.TutoringFollowUpResponse;
import com.leccionario.backend.tutoring.dto.TutoringSessionRequest;
import com.leccionario.backend.tutoring.dto.TutoringSessionResponse;
import com.leccionario.backend.tutoring.repository.TutoringFollowUpRepository;
import com.leccionario.backend.tutoring.repository.TutoringSessionRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.repository.StudentRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
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
public class TutoringService {

    private final TutoringSessionRepository sessionRepository;
    private final TutoringFollowUpRepository followUpRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public TutoringSessionResponse createSession(TutoringSessionRequest request, String username) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        TutoringSession session = new TutoringSession();
        Institution inst = new Institution();
        inst.setId(request.getInstitutionId());
        session.setInstitution(inst);

        Teacher teacher = new Teacher();
        teacher.setId(request.getTeacherId());
        session.setTeacher(teacher);

        session.setStudent(student);

        Course course = new Course();
        course.setId(request.getCourseId());
        session.setCourse(course);

        AcademicPeriod period = new AcademicPeriod();
        period.setId(request.getAcademicPeriodId());
        session.setAcademicPeriod(period);

        session.setSessionDate(request.getSessionDate() != null ? LocalDate.parse(request.getSessionDate()) : LocalDate.now());
        session.setSessionTime(request.getSessionTime() != null ? LocalTime.parse(request.getSessionTime()) : null);
        session.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30);
        session.setSessionType(request.getSessionType() != null ? request.getSessionType() : "ACADEMICA");
        session.setTopic(request.getTopic() != null ? request.getTopic() : "Sesion de tutoria");
        session.setDescription(request.getDescription());
        session.setRecommendations(request.getRecommendations());
        session.setFollowUpRequired(Boolean.TRUE.equals(request.getFollowUpRequired()));
        session.setFollowUpDate(request.getFollowUpDate() != null ? LocalDate.parse(request.getFollowUpDate()) : null);
        session.setCreatedBy(username);

        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<TutoringSessionResponse> getSessionsByStudent(Long studentId, Long periodId) {
        return sessionRepository.findByStudentIdAndAcademicPeriodId(studentId, periodId)
                .stream().map(this::toSessionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TutoringSessionResponse> getSessionsByCourse(Long courseId, Long periodId) {
        return sessionRepository.findByCourseIdAndAcademicPeriodId(courseId, periodId)
                .stream().map(this::toSessionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TutoringSessionResponse> getSessionsByTeacher(Long teacherId, Long periodId) {
        return sessionRepository.findByTeacherIdAndAcademicPeriodId(teacherId, periodId)
                .stream().map(this::toSessionResponse).toList();
    }

    @Transactional(readOnly = true)
    public TutoringSessionResponse getSession(Long id) {
        TutoringSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tutoring session not found"));
        return toSessionResponse(session);
    }

    @Transactional
    public TutoringSessionResponse updateStatus(Long sessionId, String newStatus) {
        TutoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutoring session not found"));
        session.setStatus(newStatus);
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional
    public TutoringFollowUpResponse addFollowUp(Long sessionId, String notes, String followUpDate) {
        TutoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutoring session not found"));

        TutoringFollowUp followUp = new TutoringFollowUp();
        followUp.setSession(session);
        followUp.setFollowUpDate(followUpDate != null ? LocalDate.parse(followUpDate) : LocalDate.now());
        followUp.setNotes(notes);
        followUp.setStatus("PENDIENTE");

        TutoringFollowUp saved = followUpRepository.save(followUp);
        return toFollowUpResponse(saved);
    }

    @Transactional
    public TutoringFollowUpResponse completeFollowUp(Long followUpId) {
        TutoringFollowUp followUp = followUpRepository.findById(followUpId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));
        followUp.setStatus("COMPLETADO");
        followUp.setCompletedAt(OffsetDateTime.now());
        return toFollowUpResponse(followUpRepository.save(followUp));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(Long courseId, Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = sessionRepository.countByCourseAndPeriod(courseId, periodId);
        long programadas = sessionRepository.countByCourseAndPeriodAndStatus(courseId, periodId, "PROGRAMADA");
        long realizadas = sessionRepository.countByCourseAndPeriodAndStatus(courseId, periodId, "REALIZADA");
        long canceladas = sessionRepository.countByCourseAndPeriodAndStatus(courseId, periodId, "CANCELADA");

        stats.put("total", total);
        stats.put("programadas", programadas);
        stats.put("realizadas", realizadas);
        stats.put("canceladas", canceladas);

        List<Object[]> byType = sessionRepository.countByTypeForCourseAndPeriod(courseId, periodId);
        Map<String, Long> typeMap = new LinkedHashMap<>();
        for (Object[] row : byType) {
            typeMap.put((String) row[0], (Long) row[1]);
        }
        stats.put("byType", typeMap);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentStats(Long studentId, Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = sessionRepository.countByStudentAndPeriod(studentId, periodId);
        stats.put("total", total);
        return stats;
    }

    // --- Mappers ---

    private TutoringSessionResponse toSessionResponse(TutoringSession s) {
        TutoringSessionResponse r = new TutoringSessionResponse();
        r.setId(s.getId());
        r.setTeacherId(s.getTeacher().getId());
        r.setTeacherName(s.getTeacher().getUser().getFirstName() + " " + s.getTeacher().getUser().getLastName());
        r.setStudentId(s.getStudent().getId());
        r.setStudentName(s.getStudent().getUser().getFirstName() + " " + s.getStudent().getUser().getLastName());
        r.setEnrollmentNumber(s.getStudent().getEnrollmentNumber());
        r.setCourseId(s.getCourse().getId());
        r.setCourseName(s.getCourse().getName());
        r.setAcademicPeriodId(s.getAcademicPeriod().getId());
        r.setAcademicPeriodName(s.getAcademicPeriod().getName());
        r.setSessionDate(s.getSessionDate());
        r.setSessionTime(s.getSessionTime());
        r.setDurationMinutes(s.getDurationMinutes());
        r.setSessionType(s.getSessionType());
        r.setStatus(s.getStatus());
        r.setTopic(s.getTopic());
        r.setDescription(s.getDescription());
        r.setRecommendations(s.getRecommendations());
        r.setFollowUpRequired(s.getFollowUpRequired());
        r.setFollowUpDate(s.getFollowUpDate());
        r.setFollowUpNotes(s.getFollowUpNotes());
        r.setCreatedBy(s.getCreatedBy());
        List<TutoringFollowUp> followUps = followUpRepository.findBySessionId(s.getId());
        r.setFollowUps(followUps.stream().map(this::toFollowUpResponse).toList());
        return r;
    }

    private TutoringFollowUpResponse toFollowUpResponse(TutoringFollowUp f) {
        TutoringFollowUpResponse r = new TutoringFollowUpResponse();
        r.setId(f.getId());
        r.setSessionId(f.getSession().getId());
        r.setFollowUpDate(f.getFollowUpDate());
        r.setNotes(f.getNotes());
        r.setStatus(f.getStatus());
        r.setCompletedAt(f.getCompletedAt());
        return r;
    }
}
