package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface SchoolEventRepository extends JpaRepository<SchoolEvent, Long> {
    List<SchoolEvent> findByInstitutionIdAndEventDateAfterOrderByEventDateAsc(Long institutionId, LocalDateTime after);
    List<SchoolEvent> findByInstitutionIdOrderByEventDateDesc(Long institutionId);
    List<SchoolEvent> findByInstitutionIdAndEventTypeOrderByEventDateDesc(Long institutionId, String type);
}
