package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.Evaluation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findByLessonPlanId(Long lessonPlanId);

    List<Evaluation> findByLessonPlanCourseIdAndLessonPlanSubjectId(Long courseId, Long subjectId);

    List<Evaluation> findByLessonPlanCourseIdAndLessonPlanSubjectIdAndLessonPlanPeriodId(
            Long courseId, Long subjectId, Long periodId);

    @Modifying
    @Query("DELETE FROM Evaluation e WHERE e.lessonPlan.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM Evaluation e WHERE e.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

    @Modifying
    @Query("DELETE FROM Evaluation e WHERE e.lessonPlan.teacher.id = :teacherId")
    void deleteByLessonPlanTeacherId(@Param("teacherId") Long teacherId);
}
