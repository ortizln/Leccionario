package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class EmployeeActionService {
    private final EmployeeActionRepository repo;
    public EmployeeActionService(EmployeeActionRepository repo) { this.repo = repo; }

    public List<EmployeeAction> findByEmployee(Long employeeId) { return repo.findByEmployeeIdOrderByActionDateDesc(employeeId); }
    public List<EmployeeAction> findAll(Long institutionId) { return repo.findByInstitutionIdOrderByActionDateDesc(institutionId); }
    public EmployeeAction save(EmployeeAction a) { return repo.save(a); }
    public void delete(Long id) { repo.deleteById(id); }
}
