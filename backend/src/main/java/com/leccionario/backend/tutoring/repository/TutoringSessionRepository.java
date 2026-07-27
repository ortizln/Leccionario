package com.leccionario.backend.tutoring.repository;

import com.leccionario.backend.tutoring.domain.TutoringSession;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TutoringSessionRepository extends JpaRepository<TutoringSession, Long> {

    List<TutoringSession> findByStudentIdAndAcademicPeriodId(Long studentId, Long periodId);

    List<TutoringSession> findByCourseIdAndAcademicPeriodId(Long courseId, Long periodId);

    List<TutoringSession> findByTeacherIdAndAcademicPeriodId(Long teacherId, Long periodId);

    @Query("SELECT ts FROM TutoringSession ts WHERE ts.academicPeriod.id = :periodId AND ts.status = :status")
    List<TutoringSession> findByPeriodAndStatus(@Param("periodId") Long periodId, @Param("status") String status);

    @Query("SELECT COUNT(ts) FROM TutoringSession ts WHERE ts.course.id = :courseId AND ts.academicPeriod.id = :periodId")
    long countByCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT COUNT(ts) FROM TutoringSession ts WHERE ts.course.id = :courseId AND ts.academicPeriod.id = :periodId AND ts.status = :status")
    long countByCourseAndPeriodAndStatus(@Param("courseId") Long courseId, @Param("periodId") Long periodId, @Param("status") String status);

    @Query("SELECT ts.sessionType, COUNT(ts) FROM TutoringSession ts WHERE ts.course.id = :courseId AND ts.academicPeriod.id = :periodId GROUP BY ts.sessionType")
    List<Object[]> countByTypeForCourseAndPeriod(@Param("courseId") Long courseId, @Param("periodId") Long periodId);

    @Query("SELECT COUNT(ts) FROM TutoringSession ts WHERE ts.student.id = :studentId AND ts.academicPeriod.id = :periodId")
    long countByStudentAndPeriod(@Param("studentId") Long studentId, @Param("periodId") Long periodId);
}
