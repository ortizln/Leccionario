package com.leccionario.backend.communication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CircularService {
    private final CircularRepository repository;

    public CircularService(CircularRepository repository) { this.repository = repository; }

    public List<Circular> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByPublishDateDesc(institutionId);
    }

    public List<Circular> findPublished(Long institutionId) {
        return repository.findByInstitutionIdAndStatusOrderByPublishDateDesc(institutionId, "PUBLICADA");
    }

    public List<Circular> findByCategory(Long institutionId, String category) {
        return repository.findByInstitutionIdAndCategoryOrderByPublishDateDesc(institutionId, category);
    }

    @Transactional
    public Circular save(Circular circular) { return repository.save(circular); }

    @Transactional
    public void delete(Long id) { repository.deleteById(id); }
}
