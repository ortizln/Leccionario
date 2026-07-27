package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentInsuranceRepository extends JpaRepository<StudentInsurance, Long> {
    List<StudentInsurance> findByStudentIdOrderByStartDateDesc(Long studentId);
    Optional<StudentInsurance> findByStudentIdAndStatus(Long studentId, String status);
}
