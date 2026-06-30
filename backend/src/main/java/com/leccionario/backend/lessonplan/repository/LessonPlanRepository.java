package com.leccionario.backend.lessonplan.repository;

import com.leccionario.backend.lessonplan.domain.LessonPlan;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LessonPlanRepository extends JpaRepository<LessonPlan, Long> {

    List<LessonPlan> findByLessonDateBetween(LocalDate startDate, LocalDate endDate);

    @Modifying
    @Query("DELETE FROM LessonPlan lp WHERE lp.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM LessonPlan lp WHERE lp.teacher.id = :teacherId")
    void deleteByTeacherId(@Param("teacherId") Long teacherId);
}
