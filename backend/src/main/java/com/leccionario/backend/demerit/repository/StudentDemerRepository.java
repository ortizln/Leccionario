package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.StudentDemer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentDemerRepository extends JpaRepository<StudentDemer, Long> {
    List<StudentDemer> findByStudentIdAndPeriodIdOrderByLogDateDesc(Long studentId, Long periodId);
    List<StudentDemer> findByCourseIdAndPeriodIdOrderByLogDateDesc(Long courseId, Long periodId);
    List<StudentDemer> findByTeacherIdAndPeriodIdOrderByLogDateDesc(Long teacherId, Long periodId);

    @Modifying
    @Query("DELETE FROM StudentDemer sd WHERE sd.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM StudentDemer sd WHERE sd.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

    @Modifying
    @Query("DELETE FROM StudentDemer sd WHERE sd.teacher.id = :teacherId")
    void deleteByTeacherId(@Param("teacherId") Long teacherId);
}
