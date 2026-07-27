package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecoveryExamServiceTest {

    private RecoveryExamRepository repository;
    private RecoveryExamService service;

    @BeforeEach
    void setUp() {
        repository = mock(RecoveryExamRepository.class);
        service = new RecoveryExamService(repository);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(repository.findByInstitutionIdOrderByScheduledDateDesc(1L)).thenReturn(List.of());
        List<RecoveryExam> result = service.findAll(1L);
        assertNotNull(result);
        verify(repository).findByInstitutionIdOrderByScheduledDateDesc(1L);
    }

    @Test
    void findPending_delegatesToRepository() {
        when(repository.findByInstitutionIdAndStatusOrderByScheduledDateAsc(1L, "PENDIENTE")).thenReturn(List.of());
        List<RecoveryExam> result = service.findPending(1L);
        assertNotNull(result);
        verify(repository).findByInstitutionIdAndStatusOrderByScheduledDateAsc(1L, "PENDIENTE");
    }

    @Test
    void create_savesExam() {
        RecoveryExam exam = RecoveryExam.builder()
            .institutionId(1L).studentId(10L).courseId(20L).subjectId(30L)
            .examType("SUPLETORIO").scheduledDate(LocalDate.now().plusDays(7))
            .status("PENDIENTE").build();
        when(repository.save(any())).thenReturn(exam);
        RecoveryExam saved = service.create(exam);
        assertNotNull(saved);
        assertEquals("SUPLETORIO", saved.getExamType());
    }

    @Test
    void applyScore_setsScoreAndStatus() {
        RecoveryExam exam = new RecoveryExam();
        exam.setId(1L);
        exam.setStatus("PENDIENTE");
        when(repository.findById(1L)).thenReturn(Optional.of(exam));
        when(repository.save(any())).thenReturn(exam);
        RecoveryExam result = service.applyScore(1L, new BigDecimal("8.50"));
        assertEquals("APLICADO", result.getStatus());
    }

    @Test
    void cancel_setsCancelled() {
        RecoveryExam exam = new RecoveryExam();
        exam.setId(1L);
        exam.setStatus("PENDIENTE");
        when(repository.findById(1L)).thenReturn(Optional.of(exam));
        when(repository.save(any())).thenReturn(exam);
        service.cancel(1L);
        assertEquals("CANCELADO", exam.getStatus());
    }
}
