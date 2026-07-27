package com.leccionario.backend.certificates.repository;

import com.leccionario.backend.certificates.domain.CertificateTemplate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, Long> {

    List<CertificateTemplate> findByInstitutionIdAndActiveTrue(Long institutionId);

    List<CertificateTemplate> findByInstitutionId(Long institutionId);
}
