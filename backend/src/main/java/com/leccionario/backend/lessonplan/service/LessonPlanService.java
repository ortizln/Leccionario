package com.leccionario.backend.lessonplan.service;

import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.lessonplan.domain.LessonPlan;
import com.leccionario.backend.lessonplan.dto.LessonPlanRequest;
import com.leccionario.backend.lessonplan.dto.LessonPlanResponse;
import com.leccionario.backend.lessonplan.mapper.LessonPlanMapper;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LessonPlanService {

    private final LessonPlanRepository lessonPlanRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final LessonPlanMapper lessonPlanMapper;
    private final AuditService auditService;

    @Transactional
    public LessonPlanResponse create(LessonPlanRequest request, String actor) {
        validateScheduleAssignment(request);
        LessonPlan entity = new LessonPlan();
        entity.setLessonDate(request.lessonDate());
        entity.setTeacher(teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado")));
        entity.setSubject(subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Materia no encontrada")));
        entity.setCourse(courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado")));
        entity.setPeriod(academicPeriodRepository.findById(request.periodId())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo no encontrado")));
        entity.setTopic(request.topic());
        entity.setObjective(request.objective());
        entity.setActivities(request.activities());
        entity.setResources(request.resources());
        entity.setObservations(request.observations());
        entity.setCurricularSkill(request.curricularSkill());
        entity.setCurriculumCompleted(request.curriculumCompleted());

        LessonPlan saved = lessonPlanRepository.save(entity);
        auditService.log(actor, "CREATE", "LESSON_PLAN", "Leccionario creado ID " + saved.getId());
        return lessonPlanMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LessonPlanResponse> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return lessonPlanRepository.findByLessonDateBetween(startDate, endDate)
                .stream()
                .map(lessonPlanMapper::toResponse)
                .toList();
    }

    private void validateScheduleAssignment(LessonPlanRequest request) {
        short weekday = (short) request.lessonDate().getDayOfWeek().getValue();
        boolean assignmentExists = courseScheduleRepository.existsByCourseIdAndPeriodIdAndTeacherIdAndSubjectIdAndWeekday(
                request.courseId(),
                request.periodId(),
                request.teacherId(),
                request.subjectId(),
                weekday);
        if (!assignmentExists) {
            throw new BusinessException("El docente no tiene esa materia asignada en el horario oficial para ese curso, periodo y dia.");
        }
    }
}
