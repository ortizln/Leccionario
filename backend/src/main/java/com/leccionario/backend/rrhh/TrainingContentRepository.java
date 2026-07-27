package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainingContentRepository extends JpaRepository<TrainingContent, Long> {
    List<TrainingContent> findByCourseIdOrderBySortOrderAsc(Long courseId);
}
