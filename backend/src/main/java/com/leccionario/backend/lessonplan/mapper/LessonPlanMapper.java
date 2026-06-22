package com.leccionario.backend.lessonplan.mapper;

import com.leccionario.backend.lessonplan.domain.LessonPlan;
import com.leccionario.backend.lessonplan.dto.LessonPlanResponse;
import org.springframework.stereotype.Component;

@Component
public class LessonPlanMapper {

    public LessonPlanResponse toResponse(LessonPlan entity) {
        return new LessonPlanResponse(
                entity.getId(),
                entity.getLessonDate(),
                entity.getTeacher().getUser().getFirstName() + " " + entity.getTeacher().getUser().getLastName(),
                entity.getSubject().getName(),
                entity.getCourse().getName() + " " + entity.getCourse().getParallel(),
                entity.getTopic(),
                entity.getObjective(),
                entity.isCurriculumCompleted());
    }
}
