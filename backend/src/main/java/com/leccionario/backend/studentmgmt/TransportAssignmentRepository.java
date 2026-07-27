package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransportAssignmentRepository extends JpaRepository<TransportAssignment, Long> {
    List<TransportAssignment> findByRouteIdAndStatus(Long routeId, String status);
    List<TransportAssignment> findByStudentId(Long studentId);
    long countByRouteIdAndStatus(Long routeId, String status);
    long countByStatus(String status);
}
