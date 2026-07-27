package com.leccionario.backend.conduct.repository;

import com.leccionario.backend.conduct.domain.MeritCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeritCategoryRepository extends JpaRepository<MeritCategory, Long> {

    List<MeritCategory> findByInstitutionIdAndActiveTrue(Long institutionId);

    List<MeritCategory> findByInstitutionId(Long institutionId);
}
