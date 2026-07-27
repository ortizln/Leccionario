package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.Classroom;
import com.leccionario.backend.institution.repository.ClassroomRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;

    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    public Classroom create(Classroom classroom) {
        return classroomRepository.save(classroom);
    }

    public Classroom update(Long id, Classroom updates) {
        Classroom existing = classroomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Aula no encontrada"));
        existing.setName(updates.getName());
        existing.setCode(updates.getCode());
        existing.setCampusId(updates.getCampusId());
        existing.setShiftId(updates.getShiftId());
        existing.setClassroomType(updates.getClassroomType());
        existing.setCapacity(updates.getCapacity());
        existing.setFloor(updates.getFloor());
        existing.setWing(updates.getWing());
        existing.setHasProjector(updates.getHasProjector());
        existing.setHasComputers(updates.getHasComputers());
        existing.setComputerCount(updates.getComputerCount());
        existing.setHasInternet(updates.getHasInternet());
        existing.setActive(updates.getActive());
        return classroomRepository.save(existing);
    }

    public void delete(Long id) {
        classroomRepository.deleteById(id);
    }

    public Classroom findById(Long id) {
        return classroomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Aula no encontrada"));
    }

    public List<Classroom> findByInstitution(Long institutionId) {
        return classroomRepository.findByInstitutionIdAndActiveTrueOrderByName(institutionId);
    }

    public List<Classroom> findByCampus(Long campusId) {
        return classroomRepository.findByCampusIdAndActiveTrueOrderByName(campusId);
    }

    public List<Classroom> findByType(String classroomType) {
        return classroomRepository.findByClassroomTypeAndActiveTrue(classroomType);
    }

    public Map<String, Object> getStats(Long institutionId) {
        long total = classroomRepository.countByInstitutionIdAndActiveTrue(institutionId);
        List<Classroom> all = classroomRepository.findByInstitutionIdAndActiveTrueOrderByName(institutionId);
        Map<String, Long> byType = all.stream()
            .collect(Collectors.groupingBy(Classroom::getClassroomType, Collectors.counting()));
        long totalCapacity = all.stream().mapToLong(Classroom::getCapacity).sum();
        return Map.of("total", total, "byType", byType, "totalCapacity", totalCapacity);
    }
}
