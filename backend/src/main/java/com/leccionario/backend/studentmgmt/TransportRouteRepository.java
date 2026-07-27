package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {

    @Query("SELECT r FROM TransportRoute r WHERE r.institutionId = :institutionId AND r.status = :status ORDER BY r.routeName")
    List<TransportRoute> findByInstitutionIdAndStatusOrderByName(@Param("institutionId") Long institutionId, @Param("status") String status);

    @Query("SELECT r FROM TransportRoute r WHERE r.institutionId = :institutionId ORDER BY r.routeName")
    List<TransportRoute> findByInstitutionIdOrderByNameAsc(@Param("institutionId") Long institutionId);
}
