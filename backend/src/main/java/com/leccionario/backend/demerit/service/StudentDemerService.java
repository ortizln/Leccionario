package com.leccionario.backend.demerit.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.*;
import com.leccionario.backend.demerit.dto.*;
import com.leccionario.backend.demerit.repository.*;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentDemerService {

    private final StudentDemerRepository repository;
    private final StudentDemerDetailRepository detailRepository;
    private final DemeritEvidenceRepository evidenceRepository;
    private final DemeritStatusHistoryRepository historyRepository;
    private final DemeritFaltaRepository faltaRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AcademicPeriodRepository periodRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<StudentDemerResponse> findByStudentAndPeriod(Long studentId, Long periodId) {
        return repository.findByStudentIdAndPeriodIdOrderByLogDateDesc(studentId, periodId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentDemerResponse> findByCourseAndPeriod(Long courseId, Long periodId) {
        return repository.findByCourseIdAndPeriodIdOrderByLogDateDesc(courseId, periodId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentDemerResponse> findByTeacherAndPeriod(Long teacherId, Long periodId) {
        return repository.findByTeacherIdAndPeriodIdOrderByLogDateDesc(teacherId, periodId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StudentDemerResponse create(StudentDemerRequest request, String actor) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));
        AcademicPeriod period = periodRepository.findById(request.periodId())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo no encontrado"));

        if (request.details() == null || request.details().isEmpty()) {
            throw new BusinessException("Debe incluir al menos una falta.");
        }

        Teacher teacher = null;
        if (request.teacherId() != null) {
            teacher = teacherRepository.findById(request.teacherId()).orElse(null);
        }

        Course course = null;
        if (request.courseId() != null) {
            course = student.getCourse();
        }

        StudentDemer demer = new StudentDemer();
        demer.setStudent(student);
        demer.setPeriod(period);
        demer.setCourse(course);
        demer.setTeacher(teacher);
        demer.setLogDate(request.logDate());
        demer.setObservation(request.observation() != null ? request.observation().trim() : null);
        demer.setCreatedBy(actor);
        demer.setUpdatedBy(actor);

        short totalScore = 0;
        List<StudentDemerDetail> details = new ArrayList<>();
        for (StudentDemerDetailRequest detailReq : request.details()) {
            DemeritFalta falta = faltaRepository.findById(detailReq.faltaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Falta no encontrada ID " + detailReq.faltaId()));
            short qty = detailReq.quantity() != null ? detailReq.quantity() : 1;
            short subtotal = (short) (falta.getScore() * qty);
            totalScore += subtotal;

            StudentDemerDetail detail = new StudentDemerDetail();
            detail.setStudentDemer(demer);
            detail.setFalta(falta);
            detail.setQuantity(qty);
            detail.setScore(falta.getScore());
            detail.setSubtotal(subtotal);
            details.add(detail);
        }
        demer.setTotalScore(totalScore);
        demer.setDetails(details);

        StudentDemer saved = repository.save(demer);

        DemeritStatusHistory history = new DemeritStatusHistory();
        history.setStudentDemer(saved);
        history.setChangedBy(actor);
        history.setPreviousStatus(null);
        history.setNewStatus("CREADO");
        history.setNotes("Registro inicial");
        historyRepository.save(history);

        auditService.log(actor, "CREATE", "STUDENT_DEMER", "Demerito estudiantil creado ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public StudentDemerResponse changeStatus(Long id, String newStatus, String notes, String actor) {
        StudentDemer demer = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demerito no encontrado"));

        String previousStatus = demer.getStatus().name();
        StudentDemer.DemerStatus newEnum = StudentDemer.DemerStatus.valueOf(newStatus);
        demer.setStatus(newEnum);
        demer.setUpdatedBy(actor);
        repository.save(demer);

        DemeritStatusHistory history = new DemeritStatusHistory();
        history.setStudentDemer(demer);
        history.setChangedBy(actor);
        history.setPreviousStatus(previousStatus);
        history.setNewStatus(newStatus);
        history.setNotes(notes);
        historyRepository.save(history);

        auditService.log(actor, "UPDATE_STATUS", "STUDENT_DEMER",
                "Demerito ID " + id + " cambio de " + previousStatus + " a " + newStatus);
        return toResponse(demer);
    }

    @Transactional
    public void delete(Long id, String actor) {
        StudentDemer demer = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demerito no encontrado"));
        repository.delete(demer);
        auditService.log(actor, "DELETE", "STUDENT_DEMER", "Demerito estudiantil eliminado ID " + id);
    }

    private StudentDemerResponse toResponse(StudentDemer demer) {
        return new StudentDemerResponse(
                demer.getId(),
                demer.getStudent().getId(),
                demer.getStudent().getUser().getFirstName() + " " + demer.getStudent().getUser().getLastName(),
                demer.getStudent().getEnrollmentNumber(),
                demer.getPeriod().getId(),
                demer.getPeriod().getName(),
                demer.getCourse() != null ? demer.getCourse().getId() : null,
                demer.getCourse() != null ? demer.getCourse().getName() + " " + demer.getCourse().getParallel() : null,
                demer.getTeacher() != null ? demer.getTeacher().getId() : null,
                demer.getTeacher() != null ? demer.getTeacher().getUser().getFirstName() + " " + demer.getTeacher().getUser().getLastName() : null,
                demer.getLogDate(),
                demer.getObservation(),
                demer.getTotalScore(),
                demer.getStatus().name(),
                demer.getCreatedBy(),
                demer.getDetails().stream().map(d -> new StudentDemerDetailResponse(
                        d.getId(),
                        d.getFalta().getId(),
                        d.getFalta().getCode(),
                        d.getFalta().getDescription(),
                        d.getFalta().getSeverity().name(),
                        d.getFalta().getScore(),
                        d.getQuantity(),
                        d.getScore(),
                        d.getSubtotal()
                )).toList(),
                demer.getEvidences().stream().map(e -> new DemeritEvidenceResponse(
                        e.getId(), e.getFileName(), e.getFilePath(), e.getFileType(), e.getUploadedAt()
                )).toList(),
                demer.getStatusHistory().stream().map(h -> new DemeritStatusHistoryResponse(
                        h.getId(), h.getChangedBy(), h.getChangedAt(),
                        h.getPreviousStatus(), h.getNewStatus(), h.getNotes()
                )).toList()
        );
    }
}
