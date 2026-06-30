package com.leccionario.backend.academic.repository;

import com.leccionario.backend.academic.domain.WeekStudentAssignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WeekStudentAssignmentRepository extends JpaRepository<WeekStudentAssignment, Long> {
    List<WeekStudentAssignment> findByCourseIdOrderByStartDateDesc(Long courseId);
    Optional<WeekStudentAssignment> findByCourseIdAndEndDateIsNull(Long courseId);

    @Modifying
    @Query("DELETE FROM WeekStudentAssignment w WHERE w.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM WeekStudentAssignment w WHERE w.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);
}
