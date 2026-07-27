package com.leccionario.backend.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {
    List<CashRegister> findByInstitutionIdOrderByRegisterDateDesc(Long institutionId);
    List<CashRegister> findByInstitutionIdAndStatusOrderByRegisterDateDesc(Long institutionId, String status);
    CashRegister findByInstitutionIdAndRegisterDateAndStatus(Long institutionId, LocalDate registerDate, String status);
}
