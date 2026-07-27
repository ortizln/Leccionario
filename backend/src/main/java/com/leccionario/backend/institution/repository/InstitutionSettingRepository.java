package com.leccionario.backend.institution.repository;

import com.leccionario.backend.institution.domain.InstitutionSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface InstitutionSettingRepository extends JpaRepository<InstitutionSetting, Long> {

    @Query("SELECT s FROM InstitutionSetting s WHERE s.institutionId = :institutionId ORDER BY s.category, s.settingKey")
    List<InstitutionSetting> findByInstitutionIdOrderByCategoryAndSettingKey(@Param("institutionId") Long institutionId);

    Optional<InstitutionSetting> findByInstitutionIdAndSettingKey(Long institutionId, String settingKey);
    List<InstitutionSetting> findByInstitutionIdAndCategoryOrderBySettingKey(Long institutionId, String category);
}
