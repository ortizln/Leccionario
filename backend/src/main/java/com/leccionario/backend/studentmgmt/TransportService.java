package com.leccionario.backend.studentmgmt;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class TransportService {

    private final TransportRouteRepository routeRepo;
    private final TransportAssignmentRepository assignmentRepo;

    public TransportService(TransportRouteRepository routeRepo, TransportAssignmentRepository assignmentRepo) {
        this.routeRepo = routeRepo;
        this.assignmentRepo = assignmentRepo;
    }

    public TransportRoute createRoute(TransportRoute route) { return routeRepo.save(route); }
    public TransportRoute updateRoute(Long id, TransportRoute updates) {
        TransportRoute r = routeRepo.findById(id).orElseThrow(() -> new RuntimeException("Ruta no encontrada"));
        r.setRouteName(updates.getRouteName()); r.setRouteCode(updates.getRouteCode());
        r.setDescription(updates.getDescription()); r.setOrigin(updates.getOrigin());
        r.setDestination(updates.getDestination()); r.setStops(updates.getStops());
        r.setMorningDeparture(updates.getMorningDeparture()); r.setMorningArrival(updates.getMorningArrival());
        r.setAfternoonDeparture(updates.getAfternoonDeparture()); r.setAfternoonArrival(updates.getAfternoonArrival());
        r.setCapacity(updates.getCapacity()); r.setVehiclePlate(updates.getVehiclePlate());
        r.setDriverName(updates.getDriverName()); r.setDriverPhone(updates.getDriverPhone());
        r.setMonthlyFee(updates.getMonthlyFee()); r.setStatus(updates.getStatus());
        return routeRepo.save(r);
    }
    public void deleteRoute(Long id) { routeRepo.deleteById(id); }
    public List<TransportRoute> findRoutes(Long institutionId) { return routeRepo.findByInstitutionIdAndStatusOrderByName(institutionId, "ACTIVA"); }

    public TransportAssignment assignStudent(TransportAssignment a) { return assignmentRepo.save(a); }
    public void unassignStudent(Long id) { assignmentRepo.deleteById(id); }
    public List<TransportAssignment> findAssignments(Long routeId) { return assignmentRepo.findByRouteIdAndStatus(routeId, "ACTIVO"); }
    public List<TransportAssignment> findStudentRoute(Long studentId) { return assignmentRepo.findByStudentId(studentId); }

    public Map<String, Object> getRouteStats(Long routeId) {
        long assigned = assignmentRepo.countByRouteIdAndStatus(routeId, "ACTIVO");
        TransportRoute route = routeRepo.findById(routeId).orElseThrow();
        return Map.of("assigned", assigned, "capacity", route.getCapacity());
    }

    public List<TransportRoute> findAllRoutes(Long institutionId) {
        return routeRepo.findByInstitutionIdOrderByNameAsc(institutionId);
    }

    public Map<String, Object> getInstitutionStats(Long institutionId) {
        List<TransportRoute> routes = routeRepo.findByInstitutionIdOrderByNameAsc(institutionId);
        long totalRoutes = routes.size();
        long activeRoutes = routes.stream().filter(r -> "ACTIVA".equals(r.getStatus())).count();
        long totalAssigned = assignmentRepo.countByStatus("ACTIVO");
        return Map.of("totalRoutes", totalRoutes, "activeRoutes", activeRoutes, "totalAssigned", totalAssigned);
    }
}
