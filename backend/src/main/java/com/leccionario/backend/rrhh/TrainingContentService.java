package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class TrainingContentService {
    private final TrainingContentRepository repo;
    public TrainingContentService(TrainingContentRepository repo) { this.repo = repo; }

    public List<TrainingContent> findByCourse(Long courseId) { return repo.findByCourseIdOrderBySortOrderAsc(courseId); }
    public TrainingContent save(TrainingContent c) { return repo.save(c); }
    public void delete(Long id) { repo.deleteById(id); }
}
