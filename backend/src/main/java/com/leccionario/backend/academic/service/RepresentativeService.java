package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.RepresentativeRequest;
import com.leccionario.backend.academic.dto.RepresentativeResponse;
import com.leccionario.backend.user.domain.Representative;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.RepresentativeRepository;
import com.leccionario.backend.common.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RepresentativeService {

    private final RepresentativeRepository representativeRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<RepresentativeResponse> getAllRepresentatives() {
        return representativeRepository.findAll().stream()
                .map(this::toRepresentativeResponse)
                .toList();
    }

    @Transactional
    public RepresentativeResponse createRepresentative(RepresentativeRequest request) {
        Representative rep = new Representative();
        applyRepresentative(rep, request);
        Representative saved = representativeRepository.save(rep);
        return toRepresentativeResponse(saved);
    }

    @Transactional
    public RepresentativeResponse updateRepresentative(Long id, RepresentativeRequest request) {
        Representative rep = representativeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El representante seleccionado no existe."));
        applyRepresentative(rep, request);
        Representative saved = representativeRepository.save(rep);
        return toRepresentativeResponse(saved);
    }

    @Transactional
    public void deleteRepresentative(Long id, String username) {
        Representative rep = representativeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El representante seleccionado no existe."));
        representativeRepository.deleteById(id);
    }

    private void applyRepresentative(Representative rep, RepresentativeRequest request) {
        rep.setStudentId(request.studentId());
        rep.setFullName(request.fullName().trim());
        rep.setRelationship(request.relationship().trim());
        rep.setPhone(request.phone().trim());
        rep.setEmail(request.email() != null ? request.email().trim() : null);
        rep.setEmergencyContact(request.emergencyContact() != null ? request.emergencyContact().trim() : null);
        rep.setEmergencyPhone(request.emergencyPhone() != null ? request.emergencyPhone().trim() : null);
        rep.setAddress(request.address() != null ? request.address().trim() : null);
    }

    private RepresentativeResponse toRepresentativeResponse(Representative rep) {
        String studentName = "";
        String enrollmentNumber = "";
        if (rep.getStudentId() != null) {
            var studentOpt = studentRepository.findById(rep.getStudentId());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                User user = student.getUser();
                studentName = user.getFirstName() + " " + user.getLastName();
                enrollmentNumber = student.getEnrollmentNumber();
            }
        }
        return new RepresentativeResponse(
                rep.getId(),
                rep.getStudentId(),
                studentName,
                enrollmentNumber,
                rep.getFullName(),
                rep.getRelationship(),
                rep.getPhone(),
                rep.getEmail(),
                rep.getEmergencyContact(),
                rep.getEmergencyPhone(),
                rep.getAddress());
    }
}
