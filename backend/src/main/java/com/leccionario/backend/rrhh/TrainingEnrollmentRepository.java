package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    List<TrainingEnrollment> findByEmployeeIdOrderByEnrollmentDateDesc(Long employeeId);
    List<TrainingEnrollment> findByCourseIdAndStatus(Long courseId, String status);
}
