package com.leccionario.backend.questionbank.repository;

import com.leccionario.backend.questionbank.domain.Question;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findBySubjectIdAndActiveTrue(Long subjectId);

    List<Question> findByInstitutionIdAndActiveTrue(Long institutionId);

    List<Question> findByCategoryIdAndActiveTrue(Long categoryId);

    @Query("SELECT q FROM Question q WHERE q.subject.id = :subjectId AND q.difficulty = :difficulty AND q.active = TRUE")
    List<Question> findBySubjectAndDifficulty(@Param("subjectId") Long subjectId, @Param("difficulty") String difficulty);

    @Query("SELECT q FROM Question q WHERE q.subject.id = :subjectId AND q.questionType = :type AND q.active = TRUE")
    List<Question> findBySubjectAndType(@Param("subjectId") Long subjectId, @Param("type") String type);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.institution.id = :institutionId AND q.active = TRUE")
    long countByInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT q.difficulty, COUNT(q) FROM Question q WHERE q.institution.id = :institutionId AND q.active = TRUE GROUP BY q.difficulty")
    List<Object[]> countByDifficultyForInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT q.questionType, COUNT(q) FROM Question q WHERE q.institution.id = :institutionId AND q.active = TRUE GROUP BY q.questionType")
    List<Object[]> countByTypeForInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT q FROM Question q WHERE q.institution.id = :institutionId AND q.active = TRUE AND (LOWER(q.questionText) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Question> searchByInstitution(@Param("institutionId") Long institutionId, @Param("search") String search);
}
