package com.leccionario.backend.conduct.repository;

import com.leccionario.backend.conduct.domain.StudentMerit;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentMeritRepository extends JpaRepository<StudentMerit, Long> {

    List<StudentMerit> findByStudentIdAndAcademicPeriodId(Long studentId, Long periodId);

    List<StudentMerit> findByCourseIdAndAcademicPeriodId(Long courseId, Long periodId);

    @Query("SELECT sm FROM StudentMerit sm WHERE sm.student.id = :studentId ORDER BY sm.meritDate DESC")
    List<StudentMerit> findByStudentIdAllPeriods(@Param("studentId") Long studentId);

    @Query("SELECT SUM(sm.points) FROM StudentMerit sm WHERE sm.student.id = :studentId AND sm.academicPeriod.id = :periodId")
    Long sumPointsByStudentAndPeriod(@Param("studentId") Long studentId, @Param("periodId") Long periodId);

    @Query("SELECT SUM(sm.points) FROM StudentMerit sm WHERE sm.course.id = :courseId AND sm.academicPeriod.id = :periodId")
    Long sumPointsByCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT COUNT(sm) FROM StudentMerit sm WHERE sm.course.id = :courseId AND sm.academicPeriod.id = :periodId")
    long countByCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT sm.category.name, SUM(sm.points), COUNT(sm) FROM StudentMerit sm WHERE sm.course.id = :courseId AND sm.academicPeriod.id = :periodId GROUP BY sm.category.name")
    List<Object[]> countByCategoryForCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);
}
