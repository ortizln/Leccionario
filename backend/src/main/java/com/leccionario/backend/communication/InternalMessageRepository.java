package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternalMessageRepository extends JpaRepository<InternalMessage, Long> {
    List<InternalMessage> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<InternalMessage> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
}
