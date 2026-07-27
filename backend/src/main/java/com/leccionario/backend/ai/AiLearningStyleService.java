package com.leccionario.backend.ai;

import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AiLearningStyleService {
    private final AiLearningStyleRepository repo;
    public AiLearningStyleService(AiLearningStyleRepository repo) { this.repo = repo; }

    public Optional<AiLearningStyle> findByStudent(Long studentId, Long institutionId) {
        return repo.findByStudentIdAndInstitutionId(studentId, institutionId);
    }

    public AiLearningStyle save(AiLearningStyle style) {
        double max = Math.max(style.getVisualScore(), Math.max(style.getAuditoryScore(), Math.max(style.getKinestheticScore(), style.getReadingScore())));
        if (max == style.getVisualScore()) style.setDominantStyle("VISUAL");
        else if (max == style.getAuditoryScore()) style.setDominantStyle("AUDITIVO");
        else if (max == style.getKinestheticScore()) style.setDominantStyle("CINESICO");
        else style.setDominantStyle("LECTURA_ESCRITURA");
        style.setAssessmentCount(style.getAssessmentCount() + 1);
        return repo.save(style);
    }
}
