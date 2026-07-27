package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.ReportCard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportCardRepository extends JpaRepository<ReportCard, Long> {

    List<ReportCard> findByStudentIdAndAcademicPeriodId(Long studentId, Long academicPeriodId);

    List<ReportCard> findByCourseIdAndAcademicPeriodId(Long courseId, Long academicPeriodId);

    List<ReportCard> findByAcademicPeriodId(Long academicPeriodId);

    Optional<ReportCard> findByStudentIdAndCourseIdAndAcademicPeriodId(Long studentId, Long courseId, Long academicPeriodId);

    boolean existsByStudentIdAndCourseIdAndAcademicPeriodId(Long studentId, Long courseId, Long academicPeriodId);

    @Query("SELECT rc FROM ReportCard rc WHERE rc.academicPeriod.id = :periodId AND rc.status = :status")
    List<ReportCard> findByPeriodAndStatus(@Param("periodId") Long periodId, @Param("status") String status);

    @Query("SELECT COUNT(rc) FROM ReportCard rc WHERE rc.academicPeriod.id = :periodId AND rc.status <> 'DRAFT'")
    long countFinalizedByPeriod(@Param("periodId") Long periodId);
}
