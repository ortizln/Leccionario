package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TrainingService {

    private final TrainingCourseRepository courseRepository;
    private final TrainingEnrollmentRepository enrollmentRepository;

    public TrainingService(TrainingCourseRepository courseRepository,
                           TrainingEnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public TrainingCourse createCourse(TrainingCourse course) { return courseRepository.save(course); }

    public TrainingCourse updateCourse(Long id, TrainingCourse updates) {
        TrainingCourse existing = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setProvider(updates.getProvider());
        existing.setCourseType(updates.getCourseType());
        existing.setHours(updates.getHours());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());
        existing.setMaxParticipants(updates.getMaxParticipants());
        existing.setStatus(updates.getStatus());
        return courseRepository.save(existing);
    }

    public void deleteCourse(Long id) { courseRepository.deleteById(id); }

    public TrainingCourse findCourseById(Long id) {
        return courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    }

    public List<TrainingCourse> findCourses(Long institutionId) {
        return courseRepository.findByInstitutionIdOrderByStartDateDesc(institutionId);
    }

    public List<TrainingCourse> findActiveCourses(Long institutionId) {
        return courseRepository.findByInstitutionIdAndStatusOrderByStartDateDesc(institutionId, "EN_CURSO");
    }

    public TrainingEnrollment enrollEmployee(Long courseId, Long employeeId) {
        TrainingEnrollment e = new TrainingEnrollment();
        e.setCourseId(courseId);
        e.setEmployeeId(employeeId);
        return enrollmentRepository.save(e);
    }

    public TrainingEnrollment completeEnrollment(Long enrollmentId, java.math.BigDecimal grade) {
        TrainingEnrollment e = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Inscripcion no encontrada"));
        e.setStatus("COMPLETADO");
        e.setGrade(grade);
        e.setCompletionDate(java.time.LocalDate.now());
        return enrollmentRepository.save(e);
    }

    public List<TrainingEnrollment> findEnrollmentsByEmployee(Long employeeId) {
        return enrollmentRepository.findByEmployeeIdOrderByEnrollmentDateDesc(employeeId);
    }

    public List<TrainingEnrollment> findEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseIdAndStatus(courseId, "INSCRITO");
    }
}
