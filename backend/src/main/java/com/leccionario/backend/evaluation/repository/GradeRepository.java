package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.Grade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByEvaluationId(Long evaluationId);
    Optional<Grade> findByEvaluationIdAndStudentId(Long evaluationId, Long studentId);

    @Query("SELECT g FROM Grade g WHERE g.evaluation.lessonPlan.course.id = :courseId AND g.evaluation.lessonPlan.subject.id = :subjectId")
    List<Grade> findByCourseAndSubject(@Param("courseId") Long courseId, @Param("subjectId") Long subjectId);

    @Query("SELECT g FROM Grade g WHERE g.student.id = :studentId AND g.evaluation.lessonPlan.subject.id = :subjectId AND g.evaluation.lessonPlan.period.id = :periodId")
    List<Grade> findByStudentAndSubjectAndPeriod(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId, @Param("periodId") Long periodId);
}
