package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContractService {

    private final EmploymentContractRepository contractRepository;

    public ContractService(EmploymentContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public EmploymentContract create(EmploymentContract contract, String username) {
        contract.setCreatedBy(username);
        return contractRepository.save(contract);
    }

    public EmploymentContract update(Long id, EmploymentContract updates) {
        EmploymentContract existing = contractRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Contrato no encontrado"));
        existing.setContractNumber(updates.getContractNumber());
        existing.setContractType(updates.getContractType());
        existing.setPosition(updates.getPosition());
        existing.setDepartment(updates.getDepartment());
        existing.setSalary(updates.getSalary());
        existing.setSalaryType(updates.getSalaryType());
        existing.setStartDate(updates.getStartDate());
        existing.setEndDate(updates.getEndDate());
        existing.setTrialPeriodDays(updates.getTrialPeriodDays());
        existing.setStatus(updates.getStatus());
        existing.setTerminationReason(updates.getTerminationReason());
        return contractRepository.save(existing);
    }

    public void delete(Long id) { contractRepository.deleteById(id); }

    public EmploymentContract findById(Long id) {
        return contractRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Contrato no encontrado"));
    }

    public List<EmploymentContract> findByEmployee(Long employeeId) {
        return contractRepository.findByEmployeeIdOrderByStartDateDesc(employeeId);
    }

    public EmploymentContract findActiveByEmployee(Long employeeId) {
        return contractRepository.findByEmployeeIdAndStatus(employeeId, "ACTIVO")
            .orElseThrow(() -> new RuntimeException("No hay contrato activo"));
    }

    public List<EmploymentContract> findActive() {
        return contractRepository.findByStatus("ACTIVO");
    }
}
