package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CompetencyService {

    private final CompetencyRepository repository;

    public CompetencyService(CompetencyRepository repository) {
        this.repository = repository;
    }

    public List<Competency> findAll(Long institutionId) {
        return repository.findByInstitutionIdAndIsActiveTrueOrderByNameAsc(institutionId);
    }

    public List<Competency> findByType(Long institutionId, String type) {
        return repository.findByInstitutionIdAndCompetencyTypeOrderByNameAsc(institutionId, type);
    }

    public Competency findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Competencia no encontrada"));
    }

    public Competency create(Competency competency) {
        return repository.save(competency);
    }

    public Competency update(Long id, Competency data) {
        Competency c = findById(id);
        c.setCode(data.getCode());
        c.setName(data.getName());
        c.setDescription(data.getDescription());
        c.setCompetencyType(data.getCompetencyType());
        c.setArea(data.getArea());
        c.setGradeLevel(data.getGradeLevel());
        c.setIsActive(data.getIsActive());
        return repository.save(c);
    }

    public void delete(Long id) {
        Competency c = findById(id);
        c.setIsActive(false);
        repository.save(c);
    }
}
