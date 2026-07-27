package com.leccionario.backend.questionbank.service;

import com.leccionario.backend.questionbank.domain.Question;
import com.leccionario.backend.questionbank.domain.QuestionCategory;
import com.leccionario.backend.questionbank.dto.QuestionCategoryResponse;
import com.leccionario.backend.questionbank.dto.QuestionRequest;
import com.leccionario.backend.questionbank.dto.QuestionResponse;
import com.leccionario.backend.questionbank.repository.QuestionCategoryRepository;
import com.leccionario.backend.questionbank.repository.QuestionRepository;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.academic.domain.Subject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QuestionBankServiceTest {

    private QuestionRepository questionRepository;
    private QuestionCategoryRepository categoryRepository;
    private QuestionBankService service;

    @BeforeEach
    void setUp() {
        questionRepository = mock(QuestionRepository.class);
        categoryRepository = mock(QuestionCategoryRepository.class);
        service = new QuestionBankService(questionRepository, categoryRepository);
    }

    @Test
    void getCategories_delegatesToRepository() {
        when(categoryRepository.findByInstitutionId(1L)).thenReturn(List.of());
        assertTrue(service.getCategories(1L).isEmpty());
    }

    @Test
    void createCategory_saves() {
        when(categoryRepository.save(any())).thenAnswer(inv -> {
            QuestionCategory c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
        QuestionCategoryResponse req = new QuestionCategoryResponse();
        req.setName("Matematicas");
        req.setDescription("Preguntas de mate");
        var result = service.createCategory(req, 1L);
        assertNotNull(result);
        verify(categoryRepository).save(any());
    }

    @Test
    void deleteCategory_delegates() {
        service.deleteCategory(1L);
        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void createQuestion_saves() {
        when(questionRepository.save(any())).thenAnswer(inv -> {
            Question q = inv.getArgument(0);
            q.setId(1L);
            return q;
        });
        QuestionRequest req = new QuestionRequest();
        req.setSubjectId(10L);
        req.setInstitutionId(1L);
        req.setQuestionText("2+2=");
        req.setCorrectAnswer("4");
        QuestionResponse result = service.createQuestion(req, "admin");
        assertNotNull(result);
        verify(questionRepository).save(any());
    }

    @Test
    void deactivate_setsActiveFalse() {
        Question q = new Question();
        q.setId(1L);
        q.setActive(true);
        when(questionRepository.findById(1L)).thenReturn(Optional.of(q));
        service.deactivate(1L);
        assertFalse(q.getActive());
        verify(questionRepository).save(q);
    }

    @Test
    void getBySubject_delegates() {
        when(questionRepository.findBySubjectIdAndActiveTrue(1L)).thenReturn(List.of());
        assertTrue(service.getBySubject(1L).isEmpty());
    }

    @Test
    void search_delegates() {
        when(questionRepository.findByInstitutionIdAndActiveTrue(1L)).thenReturn(List.of());
        assertTrue(service.search(1L, "test").isEmpty());
    }

    @Test
    void getByCategory_delegates() {
        when(questionRepository.findByCategoryIdAndActiveTrue(1L)).thenReturn(List.of());
        assertTrue(service.getByCategory(1L).isEmpty());
    }
}
