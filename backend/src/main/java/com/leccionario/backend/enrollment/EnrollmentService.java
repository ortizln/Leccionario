package com.leccionario.backend.enrollment;

import com.leccionario.backend.enrollment.dto.EnrollmentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    public EnrollmentDTO create(Enrollment enrollment, String username) {
        enrollment.setCreatedBy(username);
        Enrollment saved = enrollmentRepository.save(enrollment);
        return toDTO(saved);
    }

    public EnrollmentDTO update(Long id, Enrollment updates) {
        Enrollment existing = enrollmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada"));
        existing.setParallelCode(updates.getParallelCode());
        existing.setStatus(updates.getStatus());
        existing.setWithdrawalDate(updates.getWithdrawalDate());
        existing.setObservations(updates.getObservations());
        return toDTO(enrollmentRepository.save(existing));
    }

    public void delete(Long id) {
        enrollmentRepository.deleteById(id);
    }

    public EnrollmentDTO findById(Long id) {
        return toDTO(enrollmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Matricula no encontrada")));
    }

    public List<EnrollmentDTO> findByPeriod(Long periodId) {
        return enrollmentRepository.findByPeriodIdOrderByEnrollmentNumberDesc(periodId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Page<EnrollmentDTO> findByPeriod(Long periodId, Pageable pageable) {
        return enrollmentRepository.findByPeriodId(periodId, pageable).map(this::toDTO);
    }

    public List<EnrollmentDTO> findByStudent(Long studentId) {
        return enrollmentRepository.findByStudentIdOrderByEnrollmentDateDesc(studentId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<EnrollmentDTO> findByCourseAndPeriod(Long courseId, Long periodId) {
        return enrollmentRepository.findByCourseIdAndPeriodIdOrderByEnrollmentNumber(courseId, periodId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Map<String, Object> getStats(Long periodId) {
        long active = enrollmentRepository.countActiveByPeriod(periodId);
        long total = enrollmentRepository.findByPeriodIdOrderByEnrollmentNumberDesc(periodId).size();
        Map<String, Long> byStatus = enrollmentRepository.findByPeriodIdOrderByEnrollmentNumberDesc(periodId)
            .stream().collect(Collectors.groupingBy(Enrollment::getStatus, Collectors.counting()));
        return Map.of("total", total, "active", active, "byStatus", byStatus);
    }

    private EnrollmentDTO toDTO(Enrollment e) {
        return new EnrollmentDTO(
            e.getId(), e.getStudentId(), null, e.getCourseId(), null,
            e.getPeriodId(), null, e.getEnrollmentNumber(), e.getParallelCode(),
            e.getStatus(), e.getEnrollmentDate(), e.getWithdrawalDate(),
            e.getObservations(), e.getCreatedBy()
        );
    }
}
