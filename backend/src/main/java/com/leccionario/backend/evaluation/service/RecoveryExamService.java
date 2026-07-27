package com.leccionario.backend.evaluation.service;

import com.leccionario.backend.evaluation.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RecoveryExamService {

    private final RecoveryExamRepository repository;

    public RecoveryExamService(RecoveryExamRepository repository) {
        this.repository = repository;
    }

    public List<RecoveryExam> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByScheduledDateDesc(institutionId);
    }

    public List<RecoveryExam> findByStudent(Long studentId) {
        return repository.findByStudentIdOrderByScheduledDateDesc(studentId);
    }

    public List<RecoveryExam> findPending(Long institutionId) {
        return repository.findByInstitutionIdAndStatusOrderByScheduledDateAsc(institutionId, "PENDIENTE");
    }

    public RecoveryExam findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Examen de recuperacion no encontrado"));
    }

    public RecoveryExam create(RecoveryExam exam) {
        return repository.save(exam);
    }

    public RecoveryExam update(Long id, RecoveryExam data) {
        RecoveryExam e = findById(id);
        e.setScheduledDate(data.getScheduledDate());
        e.setExamType(data.getExamType());
        e.setNotes(data.getNotes());
        return repository.save(e);
    }

    public RecoveryExam applyScore(Long id, java.math.BigDecimal score) {
        RecoveryExam e = findById(id);
        e.setScore(score);
        e.setStatus("APLICADO");
        return repository.save(e);
    }

    public void cancel(Long id) {
        RecoveryExam e = findById(id);
        e.setStatus("CANCELADO");
        repository.save(e);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
