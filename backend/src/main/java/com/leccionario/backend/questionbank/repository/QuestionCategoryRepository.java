package com.leccionario.backend.questionbank.repository;

import com.leccionario.backend.questionbank.domain.QuestionCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionCategoryRepository extends JpaRepository<QuestionCategory, Long> {

    List<QuestionCategory> findByInstitutionIdAndActiveTrue(Long institutionId);

    List<QuestionCategory> findByInstitutionId(Long institutionId);
}
