package com.leccionario.backend.communication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SchoolEventService {
    private final SchoolEventRepository repository;

    public SchoolEventService(SchoolEventRepository repository) { this.repository = repository; }

    public List<SchoolEvent> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByEventDateDesc(institutionId);
    }

    public List<SchoolEvent> findUpcoming(Long institutionId) {
        return repository.findByInstitutionIdAndEventDateAfterOrderByEventDateAsc(institutionId, LocalDateTime.now());
    }

    public List<SchoolEvent> findByType(Long institutionId, String type) {
        return repository.findByInstitutionIdAndEventTypeOrderByEventDateDesc(institutionId, type);
    }

    @Transactional
    public SchoolEvent save(SchoolEvent event) { return repository.save(event); }

    @Transactional
    public void delete(Long id) { repository.deleteById(id); }
}
