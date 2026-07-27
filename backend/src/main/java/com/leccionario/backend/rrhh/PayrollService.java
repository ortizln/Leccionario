package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final PayrollEntryRepository entryRepository;
    private final EmploymentContractRepository contractRepository;

    private static final BigDecimal IESS_RATE = new BigDecimal("0.0945");

    public PayrollService(PayrollRepository payrollRepository, PayrollEntryRepository entryRepository, EmploymentContractRepository contractRepository) {
        this.payrollRepository = payrollRepository;
        this.entryRepository = entryRepository;
        this.contractRepository = contractRepository;
    }

    public List<Payroll> findAll(Long institutionId) {
        return payrollRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public Payroll findById(Long id) {
        return payrollRepository.findById(id).orElseThrow(() -> new RuntimeException("Payroll not found"));
    }

    @Transactional
    public Payroll create(Payroll payroll) {
        return payrollRepository.save(payroll);
    }

    @Transactional
    public Payroll updateStatus(Long id, String status) {
        Payroll p = payrollRepository.findById(id).orElseThrow(() -> new RuntimeException("Payroll not found"));
        p.setStatus(status);
        if ("APROBADO".equals(status)) recalculate(p);
        return payrollRepository.save(p);
    }

    public List<PayrollEntry> getEntries(Long payrollId) {
        return entryRepository.findByPayrollId(payrollId);
    }

    @Transactional
    public PayrollEntry addEntry(PayrollEntry entry) {
        if (entry.getBaseSalary() == null) {
            EmploymentContract contract = contractRepository.findByEmployeeIdAndStatus(entry.getEmployeeId(), "ACTIVO")
                    .orElseThrow(() -> new RuntimeException("No active contract for employee"));
            entry.setBaseSalary(contract.getSalary() != null ? contract.getSalary() : BigDecimal.ZERO);
        }
        BigDecimal gross = entry.getBaseSalary()
                .add(entry.getOvertimeAmount() != null ? entry.getOvertimeAmount() : BigDecimal.ZERO)
                .add(entry.getBonusAmount() != null ? entry.getBonusAmount() : BigDecimal.ZERO);
        entry.setGrossSalary(gross);
        BigDecimal iess = gross.multiply(IESS_RATE).setScale(2, RoundingMode.HALF_UP);
        entry.setIessDeduction(iess);
        BigDecimal totalDed = iess
                .add(entry.getLoanDeduction() != null ? entry.getLoanDeduction() : BigDecimal.ZERO)
                .add(entry.getOtherDeductions() != null ? entry.getOtherDeductions() : BigDecimal.ZERO);
        entry.setTotalDeductions(totalDed);
        entry.setNetSalary(gross.subtract(totalDed));
        PayrollEntry saved = entryRepository.save(entry);
        recalculate(findById(entry.getPayrollId()));
        return saved;
    }

    @Transactional
    public void deleteEntry(Long entryId) {
        PayrollEntry e = entryRepository.findById(entryId).orElseThrow(() -> new RuntimeException("Entry not found"));
        Long payrollId = e.getPayrollId();
        entryRepository.deleteById(entryId);
        recalculate(findById(payrollId));
    }

    private void recalculate(Payroll p) {
        List<PayrollEntry> entries = entryRepository.findByPayrollId(p.getId());
        BigDecimal gross = entries.stream().map(PayrollEntry::getGrossSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal ded = entries.stream().map(PayrollEntry::getTotalDeductions).reduce(BigDecimal.ZERO, BigDecimal::add);
        p.setTotalGross(gross);
        p.setTotalDeductions(ded);
        p.setTotalNet(gross.subtract(ded));
        payrollRepository.save(p);
    }

    public Map<String, Object> getPayrollStats(Long institutionId) {
        List<Payroll> payrolls = payrollRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
        long approved = payrolls.stream().filter(p -> "APROBADO".equals(p.getStatus())).count();
        long pending = payrolls.stream().filter(p -> "BORRADOR".equals(p.getStatus())).count();
        return Map.of("total", payrolls.size(), "approved", approved, "pending", pending);
    }
}
