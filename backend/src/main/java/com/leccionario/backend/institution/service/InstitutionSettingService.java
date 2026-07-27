package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.InstitutionSetting;
import com.leccionario.backend.institution.repository.InstitutionSettingRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InstitutionSettingService {

    private final InstitutionSettingRepository settingRepository;

    public InstitutionSettingService(InstitutionSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    public InstitutionSetting save(InstitutionSetting setting) {
        return settingRepository.save(setting);
    }

    public InstitutionSetting create(InstitutionSetting setting) {
        return settingRepository.save(setting);
    }

    public InstitutionSetting update(Long id, InstitutionSetting updates) {
        InstitutionSetting existing = settingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Configuracion no encontrada"));
        existing.setSettingValue(updates.getSettingValue());
        existing.setSettingType(updates.getSettingType());
        existing.setCategory(updates.getCategory());
        existing.setDescription(updates.getDescription());
        return settingRepository.save(existing);
    }

    public void delete(Long id) {
        settingRepository.deleteById(id);
    }

    public InstitutionSetting findByKey(Long institutionId, String key) {
        return settingRepository.findByInstitutionIdAndSettingKey(institutionId, key)
            .orElseThrow(() -> new RuntimeException("Configuracion no encontrada: " + key));
    }

    public List<InstitutionSetting> findByInstitution(Long institutionId) {
        return settingRepository.findByInstitutionIdOrderByCategoryAndSettingKey(institutionId);
    }

    public List<InstitutionSetting> findByCategory(Long institutionId, String category) {
        return settingRepository.findByInstitutionIdAndCategoryOrderBySettingKey(institutionId, category);
    }

    public Map<String, String> getSettingsMap(Long institutionId) {
        return settingRepository.findByInstitutionIdOrderByCategoryAndSettingKey(institutionId)
            .stream().collect(Collectors.toMap(InstitutionSetting::getSettingKey, s -> s.getSettingValue() != null ? s.getSettingValue() : ""));
    }

    public void saveBatch(Long institutionId, List<InstitutionSetting> settings) {
        for (InstitutionSetting s : settings) {
            s.setInstitutionId(institutionId);
            settingRepository.save(s);
        }
    }
}
