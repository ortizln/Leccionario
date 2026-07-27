package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StaffPermissionRepository extends JpaRepository<StaffPermission, Long> {
    List<StaffPermission> findByEmployeeIdOrderByStartDateDesc(Long employeeId);
    List<StaffPermission> findByStatusOrderByStartDateDesc(String status);
}
