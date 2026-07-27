package com.leccionario.backend.certificates.repository;

import com.leccionario.backend.certificates.domain.CertificateDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CertificateDetailRepository extends JpaRepository<CertificateDetail, Long> {

    List<CertificateDetail> findByCertificateId(Long certificateId);

    void deleteByCertificateId(Long certificateId);
}
