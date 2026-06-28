package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.StudentDemer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentDemerRepository extends JpaRepository<StudentDemer, Long> {
    List<StudentDemer> findByStudentIdAndPeriodIdOrderByLogDateDesc(Long studentId, Long periodId);
    List<StudentDemer> findByCourseIdAndPeriodIdOrderByLogDateDesc(Long courseId, Long periodId);
    List<StudentDemer> findByTeacherIdAndPeriodIdOrderByLogDateDesc(Long teacherId, Long periodId);
}
