package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class RubricService {

    private final RubricRepository repository;

    public RubricService(RubricRepository repository) {
        this.repository = repository;
    }

    public List<Rubric> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public Rubric findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Rubrica no encontrada"));
    }

    public Rubric create(Rubric rubric) {
        return repository.save(rubric);
    }

    public Rubric update(Long id, Rubric data) {
        Rubric r = findById(id);
        r.setName(data.getName());
        r.setDescription(data.getDescription());
        r.setCriteria(data.getCriteria());
        r.setTotalPoints(data.getTotalPoints());
        return repository.save(r);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
