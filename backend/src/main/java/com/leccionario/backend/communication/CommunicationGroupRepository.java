package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationGroupRepository extends JpaRepository<CommunicationGroup, Long> {
    List<CommunicationGroup> findByInstitutionIdOrderByNameAsc(Long institutionId);
}
