package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeBenefitService {
    private final EmployeeBenefitRepository repo;
    public EmployeeBenefitService(EmployeeBenefitRepository repo) { this.repo = repo; }

    public List<EmployeeBenefit> findByEmployee(Long employeeId) { return repo.findByEmployeeIdAndIsActiveTrue(employeeId); }
    public List<EmployeeBenefit> findAll(Long institutionId) { return repo.findByInstitutionId(institutionId); }
    public EmployeeBenefit save(EmployeeBenefit b) { return repo.save(b); }
    public void delete(Long id) { repo.deleteById(id); }
}
