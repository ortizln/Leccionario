package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.Campus;
import com.leccionario.backend.institution.repository.CampusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CampusService {

    private final CampusRepository campusRepository;

    public CampusService(CampusRepository campusRepository) {
        this.campusRepository = campusRepository;
    }

    public Campus create(Campus campus) {
        return campusRepository.save(campus);
    }

    public Campus update(Long id, Campus updates) {
        Campus existing = campusRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
        existing.setName(updates.getName());
        existing.setCode(updates.getCode());
        existing.setAddress(updates.getAddress());
        existing.setLatitude(updates.getLatitude());
        existing.setLongitude(updates.getLongitude());
        existing.setPhone(updates.getPhone());
        existing.setEmail(updates.getEmail());
        existing.setCampusType(updates.getCampusType());
        existing.setActive(updates.getActive());
        return campusRepository.save(existing);
    }

    public void delete(Long id) {
        campusRepository.deleteById(id);
    }

    public Campus findById(Long id) {
        return campusRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
    }

    public List<Campus> findByInstitution(Long institutionId) {
        return campusRepository.findByInstitutionIdOrderByName(institutionId);
    }

    public List<Campus> findActiveByInstitution(Long institutionId) {
        return campusRepository.findByInstitutionIdAndActiveTrueOrderByName(institutionId);
    }
}
