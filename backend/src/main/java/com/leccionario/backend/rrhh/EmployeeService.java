package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee create(Employee employee) { return employeeRepository.save(employee); }

    public Employee update(Long id, Employee updates) {
        Employee existing = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        existing.setFirstName(updates.getFirstName());
        existing.setLastName(updates.getLastName());
        existing.setIdentification(updates.getIdentification());
        existing.setIdType(updates.getIdType());
        existing.setBirthDate(updates.getBirthDate());
        existing.setGender(updates.getGender());
        existing.setCivilStatus(updates.getCivilStatus());
        existing.setNationality(updates.getNationality());
        existing.setProvince(updates.getProvince());
        existing.setCity(updates.getCity());
        existing.setAddress(updates.getAddress());
        existing.setPhone(updates.getPhone());
        existing.setMobile(updates.getMobile());
        existing.setEmail(updates.getEmail());
        existing.setPhotoUrl(updates.getPhotoUrl());
        existing.setBloodType(updates.getBloodType());
        existing.setEmergencyContact(updates.getEmergencyContact());
        existing.setEmergencyPhone(updates.getEmergencyPhone());
        existing.setPosition(updates.getPosition());
        existing.setDepartment(updates.getDepartment());
        existing.setStatus(updates.getStatus());
        existing.setNotes(updates.getNotes());
        return employeeRepository.save(existing);
    }

    public void delete(Long id) { employeeRepository.deleteById(id); }

    public Employee findById(Long id) {
        return employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
    }

    public List<Employee> findByInstitution(Long institutionId) {
        return employeeRepository.findByInstitutionId(institutionId);
    }

    public List<Employee> findActiveByInstitution(Long institutionId) {
        return employeeRepository.findByInstitutionIdAndStatus(institutionId, "ACTIVO");
    }

    public List<Employee> findByDepartment(Long institutionId, String department) {
        return employeeRepository.findByDepartmentAndInstitutionId(department, institutionId);
    }

    public Map<String, Object> getStats(Long institutionId) {
        long total = employeeRepository.findByInstitutionId(institutionId).size();
        long active = employeeRepository.countActiveByInstitution(institutionId);
        Map<String, Long> byStatus = employeeRepository.findByInstitutionId(institutionId)
            .stream().collect(Collectors.groupingBy(Employee::getStatus, Collectors.counting()));
        return Map.of("total", total, "active", active, "byStatus", byStatus);
    }
}
