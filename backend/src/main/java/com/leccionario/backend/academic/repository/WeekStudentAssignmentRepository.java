package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.WeekStudentAssignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeekStudentAssignmentRepository extends JpaRepository<WeekStudentAssignment, Long> {
    List<WeekStudentAssignment> findByCourseIdOrderByStartDateDesc(Long courseId);
    Optional<WeekStudentAssignment> findByCourseIdAndEndDateIsNull(Long courseId);
}
