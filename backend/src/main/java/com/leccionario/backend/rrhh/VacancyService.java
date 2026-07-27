package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VacancyService {
    private final VacancyRepository repo;
    public VacancyService(VacancyRepository repo) { this.repo = repo; }

    public List<Vacancy> findAll(Long institutionId) { return repo.findByInstitutionIdOrderByPublishedDateDesc(institutionId); }
    public List<Vacancy> findOpen(Long institutionId) { return repo.findByInstitutionIdAndStatusOrderByPublishedDateDesc(institutionId, "OPEN"); }
    public Vacancy save(Vacancy v) { return repo.save(v); }
    public void delete(Long id) { repo.deleteById(id); }
}
