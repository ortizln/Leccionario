package com.leccionario.backend.nee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SpecialNeedRepository extends JpaRepository<SpecialNeed, Long> {

    List<SpecialNeed> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<SpecialNeed> findByStatusOrderByDiagnosisDesc(String status);

    List<SpecialNeed> findByNeedTypeAndStatus(String needType, String status);

    @Query("SELECT COUNT(s) FROM SpecialNeed s WHERE s.status = 'ACTIVA'")
    long countActive();

    @Query("SELECT s.needType, COUNT(s) FROM SpecialNeed s WHERE s.status = 'ACTIVA' GROUP BY s.needType")
    List<Object[]> countByTypeActive();
}
