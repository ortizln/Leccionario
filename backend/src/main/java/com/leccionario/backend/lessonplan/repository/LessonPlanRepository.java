package com.leccionario.backend.lessonplan.repository;

import com.leccionario.backend.lessonplan.domain.LessonPlan;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonPlanRepository extends JpaRepository<LessonPlan, Long> {

    List<LessonPlan> findByLessonDateBetween(LocalDate startDate, LocalDate endDate);
}
