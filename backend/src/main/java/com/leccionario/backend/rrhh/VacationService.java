package com.leccionario.backend.rrhh;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class VacationService {

    private final VacationPeriodRepository periodRepository;
    private final VacationRequestRepository requestRepository;
    private final StaffPermissionRepository permissionRepository;

    public VacationService(VacationPeriodRepository periodRepository,
                           VacationRequestRepository requestRepository,
                           StaffPermissionRepository permissionRepository) {
        this.periodRepository = periodRepository;
        this.requestRepository = requestRepository;
        this.permissionRepository = permissionRepository;
    }

    public VacationPeriod getOrCreatePeriod(Long employeeId, Integer year) {
        return periodRepository.findByEmployeeIdAndYear(employeeId, year)
            .orElseGet(() -> {
                VacationPeriod p = new VacationPeriod();
                p.setEmployeeId(employeeId);
                p.setYear(year);
                p.setTotalDays(15);
                p.setUsedDays(0);
                return periodRepository.save(p);
            });
    }

    public VacationRequest createRequest(VacationRequest request, String username) {
        VacationPeriod period = getOrCreatePeriod(request.getEmployeeId(), LocalDate.now().getYear());
        request.setPeriodId(period.getId());
        VacationRequest saved = requestRepository.save(request);
        period.setUsedDays(period.getUsedDays() + request.getDaysRequested());
        periodRepository.save(period);
        return saved;
    }

    public VacationRequest approveRequest(Long id, String approvedBy) {
        VacationRequest req = requestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        req.setStatus("APROBADA");
        req.setApprovedBy(approvedBy);
        req.setApprovalDate(LocalDate.now());
        return requestRepository.save(req);
    }

    public VacationRequest rejectRequest(Long id, String approvedBy) {
        VacationRequest req = requestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        req.setStatus("RECHAZADA");
        req.setApprovedBy(approvedBy);
        req.setApprovalDate(LocalDate.now());
        VacationPeriod period = periodRepository.findById(req.getPeriodId())
            .orElseThrow(() -> new RuntimeException("Periodo no encontrado"));
        period.setUsedDays(period.getUsedDays() - req.getDaysRequested());
        periodRepository.save(period);
        return requestRepository.save(req);
    }

    public List<VacationRequest> findByEmployee(Long employeeId) {
        return requestRepository.findByEmployeeIdOrderByStartDateDesc(employeeId);
    }

    public List<VacationRequest> findPending() {
        return requestRepository.findByStatusOrderByStartDateDesc("PENDIENTE");
    }

    public List<VacationPeriod> findPeriods(Long employeeId) {
        return periodRepository.findByEmployeeIdOrderByYearDesc(employeeId);
    }

    // Staff Permissions
    public StaffPermission createPermission(StaffPermission permission) {
        return permissionRepository.save(permission);
    }

    public StaffPermission approvePermission(Long id, String approvedBy) {
        StaffPermission p = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        p.setStatus("APROBADO");
        p.setApprovedBy(approvedBy);
        p.setApprovalDate(LocalDate.now());
        return permissionRepository.save(p);
    }

    public StaffPermission rejectPermission(Long id, String approvedBy) {
        StaffPermission p = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        p.setStatus("RECHAZADO");
        p.setApprovedBy(approvedBy);
        p.setApprovalDate(LocalDate.now());
        return permissionRepository.save(p);
    }

    public List<StaffPermission> findPermissionsByEmployee(Long employeeId) {
        return permissionRepository.findByEmployeeIdOrderByStartDateDesc(employeeId);
    }

    public List<StaffPermission> findPendingPermissions() {
        return permissionRepository.findByStatusOrderByStartDateDesc("PENDIENTE");
    }
}
