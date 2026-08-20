package com.leccionario.backend.adaptation;

import com.leccionario.backend.adaptation.dto.AdaptationDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdaptationService {

    private final CurricularAdaptationRepository adaptationRepository;

    public AdaptationService(CurricularAdaptationRepository adaptationRepository) {
        this.adaptationRepository = adaptationRepository;
    }

    public List<AdaptationDTO> findAll() {
        return adaptationRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AdaptationDTO create(CurricularAdaptation adaptation, String username) {
        adaptation.setCreatedBy(username);
        return toDTO(adaptationRepository.save(adaptation));
    }

    public AdaptationDTO update(Long id, CurricularAdaptation updates) {
        CurricularAdaptation existing = adaptationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Adaptacion no encontrada"));
        existing.setSubjectId(updates.getSubjectId());
        existing.setAdaptationType(updates.getAdaptationType());
        existing.setArea(updates.getArea());
        existing.setDescription(updates.getDescription());
        existing.setGoals(updates.getGoals());
        existing.setStrategies(updates.getStrategies());
        existing.setEvaluationAdjustments(updates.getEvaluationAdjustments());
        existing.setStatus(updates.getStatus());
        return toDTO(adaptationRepository.save(existing));
    }

    public void delete(Long id) {
        adaptationRepository.deleteById(id);
    }

    public AdaptationDTO findById(Long id) {
        return toDTO(adaptationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Adaptacion no encontrada")));
    }

    public List<AdaptationDTO> findByStudent(Long studentId) {
        return adaptationRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AdaptationDTO> findByNEE(Long specialNeedsId) {
        return adaptationRepository.findBySpecialNeedsId(specialNeedsId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private AdaptationDTO toDTO(CurricularAdaptation a) {
        return new AdaptationDTO(
            a.getId(), a.getSpecialNeedsId(), a.getStudentId(), null,
            a.getSubjectId(), null, a.getAdaptationType(), a.getArea(),
            a.getDescription(), a.getGoals(), a.getStrategies(),
            a.getEvaluationAdjustments(), a.getPeriodId(), a.getStatus(), a.getCreatedBy()
        );
    }
}
