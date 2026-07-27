package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainingCourseRepository extends JpaRepository<TrainingCourse, Long> {
    List<TrainingCourse> findByInstitutionIdAndStatusOrderByStartDateDesc(Long institutionId, String status);
    List<TrainingCourse> findByInstitutionIdOrderByStartDateDesc(Long institutionId);
}
