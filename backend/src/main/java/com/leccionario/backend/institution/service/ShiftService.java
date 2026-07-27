package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.Shift;
import com.leccionario.backend.institution.repository.ShiftRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftService(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    public Shift create(Shift shift) {
        return shiftRepository.save(shift);
    }

    public Shift update(Long id, Shift updates) {
        Shift existing = shiftRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Jornada no encontrada"));
        existing.setName(updates.getName());
        existing.setCode(updates.getCode());
        existing.setStartTime(updates.getStartTime());
        existing.setEndTime(updates.getEndTime());
        existing.setShiftType(updates.getShiftType());
        existing.setActive(updates.getActive());
        return shiftRepository.save(existing);
    }

    public void delete(Long id) {
        shiftRepository.deleteById(id);
    }

    public Shift findById(Long id) {
        return shiftRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Jornada no encontrada"));
    }

    public List<Shift> findByInstitution(Long institutionId) {
        return shiftRepository.findByInstitutionIdOrderByName(institutionId);
    }

    public List<Shift> findActiveByInstitution(Long institutionId) {
        return shiftRepository.findByInstitutionIdAndActiveTrueOrderByName(institutionId);
    }
}
