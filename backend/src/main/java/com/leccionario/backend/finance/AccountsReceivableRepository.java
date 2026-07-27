package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AccountsReceivableRepository extends JpaRepository<AccountsReceivable, Long> {
    List<AccountsReceivable> findByInstitutionIdAndStatusOrderByDueDateDesc(Long institutionId, String status);
    List<AccountsReceivable> findByStudentIdOrderByDueDateDesc(Long studentId);

    @Query("SELECT ar FROM AccountsReceivable ar WHERE ar.institutionId = :institutionId ORDER BY ar.dueDate DESC")
    List<AccountsReceivable> findAllByInstitutionId(@Param("institutionId") Long institutionId);
}
