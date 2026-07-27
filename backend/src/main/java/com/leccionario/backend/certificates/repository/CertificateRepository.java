package com.leccionario.backend.certificates.repository;

import com.leccionario.backend.certificates.domain.Certificate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    List<Certificate> findByStudentId(Long studentId);

    List<Certificate> findByAcademicPeriodId(Long periodId);

    List<Certificate> findByInstitutionId(Long institutionId);

    Optional<Certificate> findByCertificateNumber(String certificateNumber);

    @Query("SELECT c FROM Certificate c WHERE c.institution.id = :institutionId AND c.status = :status")
    List<Certificate> findByInstitutionAndStatus(@Param("institutionId") Long institutionId, @Param("status") String status);

    @Query("SELECT c FROM Certificate c WHERE c.student.id = :studentId AND c.academicPeriod.id = :periodId AND c.template.templateType = :type")
    List<Certificate> findByStudentAndPeriodAndType(@Param("studentId") Long studentId, @Param("periodId") Long periodId, @Param("type") String type);

    boolean existsByCertificateNumber(String certificateNumber);

    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.institution.id = :institutionId AND c.status = 'ISSUED'")
    long countIssuedByInstitution(@Param("institutionId") Long institutionId);
}
