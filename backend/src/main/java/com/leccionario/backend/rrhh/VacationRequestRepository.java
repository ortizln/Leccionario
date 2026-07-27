package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VacationRequestRepository extends JpaRepository<VacationRequest, Long> {
    List<VacationRequest> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    List<VacationRequest> findByStatusOrderByStartDateDesc(String status);
    List<VacationRequest> findByEmployeeIdAndStatus(Long employeeId, String status);
}
