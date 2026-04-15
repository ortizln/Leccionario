package com.leccionario.backend.branding.repository;

import com.leccionario.backend.branding.domain.InstitutionBranding;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionBrandingRepository extends JpaRepository<InstitutionBranding, Long> {

    Optional<InstitutionBranding> findByInstitutionId(Long institutionId);
}
