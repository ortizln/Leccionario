package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EmployeeEvaluationService {
    private final EmployeeEvaluationRepository repository;
    private final EmployeeRepository employeeRepository;

    public EmployeeEvaluationService(EmployeeEvaluationRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public List<EmployeeEvaluation> findAll(Long institutionId) {
        return repository.findByInstitutionIdOrderByEvaluationDateDesc(institutionId);
    }

    public List<EmployeeEvaluation> findByEmployee(Long employeeId) {
        return repository.findByEmployeeIdOrderByEvaluationDateDesc(employeeId);
    }

    public List<EmployeeEvaluation> findByType(Long institutionId, String type) {
        return repository.findByInstitutionIdAndEvaluationTypeOrderByEvaluationDateDesc(institutionId, type);
    }

    @Transactional
    public EmployeeEvaluation save(EmployeeEvaluation eval) {
        Employee employee = employeeRepository.findById(eval.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        eval.setEmployee(employee);
        return repository.save(eval);
    }

    @Transactional
    public EmployeeEvaluation complete(Long id, java.math.BigDecimal score, String comments) {
        EmployeeEvaluation eval = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluacion no encontrada"));
        eval.setStatus("COMPLETADA");
        eval.setScore(score);
        eval.setComments(comments);
        return repository.save(eval);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
