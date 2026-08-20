package com.leccionario.backend.nee;

import com.leccionario.backend.nee.dto.SpecialNeedDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpecialNeedService {

    private final SpecialNeedRepository specialNeedRepository;

    public SpecialNeedService(SpecialNeedRepository specialNeedRepository) {
        this.specialNeedRepository = specialNeedRepository;
    }

    public SpecialNeedDTO create(SpecialNeed sn, String username) {
        sn.setCreatedBy(username);
        return toDTO(specialNeedRepository.save(sn));
    }

    public SpecialNeedDTO update(Long id, SpecialNeed updates) {
        SpecialNeed existing = specialNeedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro NEE no encontrado"));
        existing.setDiagnosis(updates.getDiagnosis());
        existing.setDiagnosisDate(updates.getDiagnosisDate());
        existing.setNeedType(updates.getNeedType());
        existing.setSeverity(updates.getSeverity());
        existing.setDescription(updates.getDescription());
        existing.setProfessional(updates.getProfessional());
        existing.setProfessionalContact(updates.getProfessionalContact());
        existing.setIepSummary(updates.getIepSummary());
        existing.setStatus(updates.getStatus());
        return toDTO(specialNeedRepository.save(existing));
    }

    public void delete(Long id) {
        specialNeedRepository.deleteById(id);
    }

    public SpecialNeedDTO findById(Long id) {
        return toDTO(specialNeedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro NEE no encontrado")));
    }

    public List<SpecialNeedDTO> findByStudent(Long studentId) {
        return specialNeedRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SpecialNeedDTO> findAllActive() {
        return specialNeedRepository.findByStatusOrderByDiagnosisDesc("ACTIVA")
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SpecialNeedDTO> findByType(String needType) {
        return specialNeedRepository.findByNeedTypeAndStatus(needType, "ACTIVA")
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Map<String, Object> getStats() {
        long active = specialNeedRepository.countActive();
        List<Object[]> byType = specialNeedRepository.countByTypeActive();
        Map<String, Long> typeMap = byType.stream()
            .collect(Collectors.toMap(o -> (String) o[0], o -> (Long) o[1]));
        return Map.of("activeCount", active, "byType", typeMap);
    }

    private SpecialNeedDTO toDTO(SpecialNeed s) {
        return new SpecialNeedDTO(
            s.getId(), s.getStudentId(), null, s.getDiagnosis(), s.getDiagnosisDate(),
            s.getNeedType(), s.getSeverity(), s.getDescription(), s.getProfessional(),
            s.getProfessionalContact(), s.getIepSummary(), s.getStatus(), s.getCreatedBy()
        );
    }
}
