package com.leccionario.backend.studentmgmt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentWellnessServiceTest {

    private PsychologicalEvaluationRepository psychRepo;
    private StudentInsuranceRepository insuranceRepo;
    private StudentVaccinationRepository vaccinationRepo;
    private JdbcTemplate jdbc;
    private StudentWellnessService service;

    @BeforeEach
    void setUp() {
        psychRepo = mock(PsychologicalEvaluationRepository.class);
        insuranceRepo = mock(StudentInsuranceRepository.class);
        vaccinationRepo = mock(StudentVaccinationRepository.class);
        jdbc = mock(JdbcTemplate.class);
        service = new StudentWellnessService(psychRepo, insuranceRepo, vaccinationRepo, jdbc);
    }

    @Test
    void saveEvaluation_savesAndReturns() {
        PsychologicalEvaluation eval = new PsychologicalEvaluation();
        eval.setStudentId(1L);
        when(psychRepo.save(eval)).thenReturn(eval);
        PsychologicalEvaluation result = service.saveEvaluation(eval);
        assertEquals(1L, result.getStudentId());
    }

    @Test
    void getEvaluations_delegatesToRepository() {
        when(psychRepo.findByStudentIdOrderByEvaluationDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.getEvaluations(1L).isEmpty());
    }

    @Test
    void deleteEvaluation_delegatesToRepository() {
        service.deleteEvaluation(1L);
        verify(psychRepo).deleteById(1L);
    }

    @Test
    void saveInsurance_savesAndReturns() {
        StudentInsurance ins = new StudentInsurance();
        ins.setStudentId(1L);
        when(insuranceRepo.save(ins)).thenReturn(ins);
        StudentInsurance result = service.saveInsurance(ins);
        assertEquals(1L, result.getStudentId());
    }

    @Test
    void getInsurance_delegatesToRepository() {
        when(insuranceRepo.findByStudentIdOrderByStartDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.getInsurance(1L).isEmpty());
    }

    @Test
    void deleteInsurance_delegatesToRepository() {
        service.deleteInsurance(1L);
        verify(insuranceRepo).deleteById(1L);
    }
}
