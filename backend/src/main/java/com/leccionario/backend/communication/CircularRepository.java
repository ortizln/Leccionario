package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CircularRepository extends JpaRepository<Circular, Long> {
    List<Circular> findByInstitutionIdAndStatusOrderByPublishDateDesc(Long institutionId, String status);
    List<Circular> findByInstitutionIdOrderByPublishDateDesc(Long institutionId);
    List<Circular> findByInstitutionIdAndCategoryOrderByPublishDateDesc(Long institutionId, String category);
}
