package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.PeriodGrade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PeriodGradeRepository extends JpaRepository<PeriodGrade, Long> {
    List<PeriodGrade> findByStudentIdAndAcademicPeriodId(Long studentId, Long periodId);
    List<PeriodGrade> findByCourseIdAndSubjectIdAndAcademicPeriodId(Long courseId, Long subjectId, Long periodId);

    @Query("SELECT pg FROM PeriodGrade pg WHERE pg.course.id = :courseId AND pg.academicPeriod.id = :periodId ORDER BY pg.student.id, pg.subject.id")
    List<PeriodGrade> findByCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    Optional<PeriodGrade> findByStudentIdAndCourseIdAndSubjectIdAndAcademicPeriodId(
            Long studentId, Long courseId, Long subjectId, Long periodId);

    @Query("SELECT AVG(pg.averageScore) FROM PeriodGrade pg WHERE pg.student.id = :studentId AND pg.course.id = :courseId AND pg.academicPeriod.id = :periodId AND pg.averageScore IS NOT NULL")
    java.math.BigDecimal calculatePeriodAverage(@Param("studentId") Long studentId, @Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT pg FROM PeriodGrade pg WHERE pg.student.id = :studentId ORDER BY pg.academicPeriod.id, pg.course.id, pg.subject.id")
    List<PeriodGrade> findByStudentIdAllPeriods(@Param("studentId") Long studentId);
}
