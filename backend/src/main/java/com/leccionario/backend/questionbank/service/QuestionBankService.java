package com.leccionario.backend.questionbank.service;

import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.questionbank.domain.Question;
import com.leccionario.backend.questionbank.domain.QuestionCategory;
import com.leccionario.backend.questionbank.dto.QuestionCategoryResponse;
import com.leccionario.backend.questionbank.dto.QuestionRequest;
import com.leccionario.backend.questionbank.dto.QuestionResponse;
import com.leccionario.backend.questionbank.repository.QuestionCategoryRepository;
import com.leccionario.backend.questionbank.repository.QuestionRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionRepository questionRepository;
    private final QuestionCategoryRepository categoryRepository;

    // --- Categories ---

    @Transactional(readOnly = true)
    public List<QuestionCategoryResponse> getCategories(Long institutionId) {
        return categoryRepository.findByInstitutionId(institutionId)
                .stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public QuestionCategoryResponse createCategory(QuestionCategoryResponse request, Long institutionId) {
        QuestionCategory cat = new QuestionCategory();
        Institution inst = new Institution();
        inst.setId(institutionId);
        cat.setInstitution(inst);
        cat.setName(request.getName());
        cat.setDescription(request.getDescription());
        cat.setActive(true);
        return toCategoryResponse(categoryRepository.save(cat));
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // --- Questions ---

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request, String username) {
        Question q = new Question();
        Institution inst = new Institution();
        inst.setId(request.getInstitutionId());
        q.setInstitution(inst);

        Subject subject = new Subject();
        subject.setId(request.getSubjectId());
        q.setSubject(subject);

        if (request.getCategoryId() != null) {
            QuestionCategory cat = new QuestionCategory();
            cat.setId(request.getCategoryId());
            q.setCategory(cat);
        }

        q.setQuestionType(request.getQuestionType() != null ? request.getQuestionType() : "OPEN");
        q.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM");
        q.setQuestionText(request.getQuestionText());
        q.setCorrectAnswer(request.getCorrectAnswer());
        q.setOptionA(request.getOptionA());
        q.setOptionB(request.getOptionB());
        q.setOptionC(request.getOptionC());
        q.setOptionD(request.getOptionD());
        q.setExplanation(request.getExplanation());
        q.setPoints(request.getPoints());
        q.setTags(request.getTags());
        q.setCreatedBy(username);

        return toQuestionResponse(questionRepository.save(q));
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (request.getCategoryId() != null) {
            QuestionCategory cat = new QuestionCategory();
            cat.setId(request.getCategoryId());
            q.setCategory(cat);
        }
        if (request.getSubjectId() != null) {
            Subject subject = new Subject();
            subject.setId(request.getSubjectId());
            q.setSubject(subject);
        }
        if (request.getQuestionType() != null) q.setQuestionType(request.getQuestionType());
        if (request.getDifficulty() != null) q.setDifficulty(request.getDifficulty());
        if (request.getQuestionText() != null) q.setQuestionText(request.getQuestionText());
        if (request.getCorrectAnswer() != null) q.setCorrectAnswer(request.getCorrectAnswer());
        if (request.getOptionA() != null) q.setOptionA(request.getOptionA());
        if (request.getOptionB() != null) q.setOptionB(request.getOptionB());
        if (request.getOptionC() != null) q.setOptionC(request.getOptionC());
        if (request.getOptionD() != null) q.setOptionD(request.getOptionD());
        if (request.getExplanation() != null) q.setExplanation(request.getExplanation());
        if (request.getPoints() != null) q.setPoints(request.getPoints());
        if (request.getTags() != null) q.setTags(request.getTags());

        return toQuestionResponse(questionRepository.save(q));
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(Long id) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return toQuestionResponse(q);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getBySubject(Long subjectId) {
        return questionRepository.findBySubjectIdAndActiveTrue(subjectId)
                .stream().map(this::toQuestionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getByCategory(Long categoryId) {
        return questionRepository.findByCategoryIdAndActiveTrue(categoryId)
                .stream().map(this::toQuestionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> search(Long institutionId, String search) {
        return questionRepository.searchByInstitution(institutionId, search)
                .stream().map(this::toQuestionResponse).toList();
    }

    @Transactional
    public void deactivate(Long id) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        q.setActive(false);
        questionRepository.save(q);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(Long institutionId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = questionRepository.countByInstitution(institutionId);
        stats.put("total", total);

        List<Object[]> byDifficulty = questionRepository.countByDifficultyForInstitution(institutionId);
        Map<String, Long> diffMap = new LinkedHashMap<>();
        diffMap.put("EASY", 0L);
        diffMap.put("MEDIUM", 0L);
        diffMap.put("HARD", 0L);
        for (Object[] row : byDifficulty) {
            diffMap.put((String) row[0], (Long) row[1]);
        }
        stats.put("byDifficulty", diffMap);

        List<Object[]> byType = questionRepository.countByTypeForInstitution(institutionId);
        Map<String, Long> typeMap = new LinkedHashMap<>();
        for (Object[] row : byType) {
            typeMap.put((String) row[0], (Long) row[1]);
        }
        stats.put("byType", typeMap);
        return stats;
    }

    // --- Mappers ---

    private QuestionCategoryResponse toCategoryResponse(QuestionCategory c) {
        QuestionCategoryResponse r = new QuestionCategoryResponse();
        r.setId(c.getId());
        r.setInstitutionId(c.getInstitution().getId());
        r.setName(c.getName());
        r.setDescription(c.getDescription());
        r.setActive(c.getActive());
        return r;
    }

    private QuestionResponse toQuestionResponse(Question q) {
        QuestionResponse r = new QuestionResponse();
        r.setId(q.getId());
        r.setSubjectId(q.getSubject().getId());
        r.setSubjectName(q.getSubject().getName());
        if (q.getCategory() != null) {
            r.setCategoryId(q.getCategory().getId());
            r.setCategoryName(q.getCategory().getName());
        }
        r.setQuestionType(q.getQuestionType());
        r.setDifficulty(q.getDifficulty());
        r.setQuestionText(q.getQuestionText());
        r.setCorrectAnswer(q.getCorrectAnswer());
        r.setOptionA(q.getOptionA());
        r.setOptionB(q.getOptionB());
        r.setOptionC(q.getOptionC());
        r.setOptionD(q.getOptionD());
        r.setExplanation(q.getExplanation());
        r.setPoints(q.getPoints());
        r.setTags(q.getTags());
        r.setCreatedBy(q.getCreatedBy());
        r.setActive(q.getActive());
        return r;
    }
}
