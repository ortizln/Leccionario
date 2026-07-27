package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParentCommunicationRepository extends JpaRepository<ParentCommunication, Long> {
    List<ParentCommunication> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<ParentCommunication> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<ParentCommunication> findByRepresentativeIdOrderByCreatedAtDesc(Long representativeId);
    long countByInstitutionIdAndStatus(Long institutionId, String status);
}
