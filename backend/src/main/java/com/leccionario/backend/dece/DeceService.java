package com.leccionario.backend.dece;

import com.leccionario.backend.dece.dto.DeceCaseDTO;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DeceService {

    private final DeceCaseRepository deceCaseRepository;
    private final DeceFollowUpRepository deceFollowUpRepository;

    public DeceService(DeceCaseRepository deceCaseRepository, DeceFollowUpRepository deceFollowUpRepository) {
        this.deceCaseRepository = deceCaseRepository;
        this.deceFollowUpRepository = deceFollowUpRepository;
    }

    public DeceCaseDTO create(DeceCase deceCase, String username) {
        deceCase.setCreatedBy(username);
        return toDTO(deceCaseRepository.save(deceCase));
    }

    public DeceCaseDTO update(Long id, DeceCase updates) {
        DeceCase existing = deceCaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caso DECE no encontrado"));
        existing.setCaseType(updates.getCaseType());
        existing.setPriority(updates.getPriority());
        existing.setDescription(updates.getDescription());
        existing.setCounselorName(updates.getCounselorName());
        existing.setInterventions(updates.getInterventions());
        existing.setFollowUpNotes(updates.getFollowUpNotes());
        existing.setStatus(updates.getStatus());
        existing.setCloseDate(updates.getCloseDate());
        existing.setResult(updates.getResult());
        return toDTO(deceCaseRepository.save(existing));
    }

    public void delete(Long id) {
        deceCaseRepository.deleteById(id);
    }

    public DeceCaseDTO findById(Long id) {
        return toDTO(deceCaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caso DECE no encontrado")));
    }

    public List<DeceCaseDTO> findByStudent(Long studentId) {
        return deceCaseRepository.findByStudentIdOrderByOpenDateDesc(studentId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DeceCaseDTO> findOpen() {
        return deceCaseRepository.findByStatusOrderByOpenDateDesc("ABIERTO")
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DeceCaseDTO> findByType(String caseType) {
        return deceCaseRepository.findByCaseTypeAndStatus(caseType, "ABIERTO")
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DeceFollowUp addFollowUp(Long caseId, DeceFollowUp followUp, String username) {
        followUp.setCaseId(caseId);
        followUp.setCreatedBy(username);
        return deceFollowUpRepository.save(followUp);
    }

    public List<DeceFollowUp> getFollowUps(Long caseId) {
        return deceFollowUpRepository.findByCaseIdOrderByDateDesc(caseId);
    }

    public Map<String, Object> getStats() {
        long open = deceCaseRepository.countOpenCases();
        List<Object[]> byType = deceCaseRepository.countOpenByType();
        Map<String, Long> typeMap = byType.stream()
            .collect(Collectors.toMap(o -> (String) o[0], o -> (Long) o[1]));
        return Map.of("openCases", open, "byType", typeMap);
    }

    private DeceCaseDTO toDTO(DeceCase c) {
        return new DeceCaseDTO(
            c.getId(), c.getStudentId(), null, c.getCaseType(), c.getPriority(),
            c.getDescription(), c.getCounselorName(), c.getInterventions(),
            c.getFollowUpNotes(), c.getStatus(), c.getOpenDate(), c.getCloseDate(),
            c.getResult(), c.getCreatedBy()
        );
    }
}
