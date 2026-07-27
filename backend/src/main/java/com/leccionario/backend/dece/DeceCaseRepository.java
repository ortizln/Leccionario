package com.leccionario.backend.dece;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DeceCaseRepository extends JpaRepository<DeceCase, Long> {

    List<DeceCase> findByStudentIdOrderByOpenDateDesc(Long studentId);

    List<DeceCase> findByStatusOrderByOpenDateDesc(String status);

    List<DeceCase> findByCaseTypeAndStatus(String caseType, String status);

    @Query("SELECT COUNT(c) FROM DeceCase c WHERE c.status IN ('ABIERTO', 'EN_PROCESO')")
    long countOpenCases();

    @Query("SELECT c.caseType, COUNT(c) FROM DeceCase c WHERE c.status IN ('ABIERTO', 'EN_PROCESO') GROUP BY c.caseType")
    List<Object[]> countOpenByType();
}

interface DeceFollowUpRepository extends JpaRepository<DeceFollowUp, Long> {
    List<DeceFollowUp> findByCaseIdOrderByDateDesc(Long caseId);
}
