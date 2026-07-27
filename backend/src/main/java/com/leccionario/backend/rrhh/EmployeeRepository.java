package com.leccionario.backend.rrhh;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e WHERE e.institutionId = :institutionId AND e.status = :status ORDER BY e.lastName, e.firstName")
    List<Employee> findByInstitutionIdAndStatus(@Param("institutionId") Long institutionId, @Param("status") String status);

    @Query("SELECT e FROM Employee e WHERE e.institutionId = :institutionId ORDER BY e.lastName, e.firstName")
    List<Employee> findByInstitutionId(@Param("institutionId") Long institutionId);

    List<Employee> findByDepartmentAndInstitutionId(String department, Long institutionId);
    long countByInstitutionIdAndStatus(Long institutionId, String status);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.institutionId = ?1 AND e.status = 'ACTIVO'")
    long countActiveByInstitution(Long institutionId);
}
