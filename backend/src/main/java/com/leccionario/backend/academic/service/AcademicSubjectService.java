package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.AcademicSubjectRequest;
import com.leccionario.backend.academic.dto.AcademicSubjectResponse;
import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.common.exception.BusinessException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AcademicSubjectService {

    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<AcademicSubjectResponse> listSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::toSubjectResponse)
                .toList();
    }

    @Transactional
    public AcademicSubjectResponse createSubject(AcademicSubjectRequest request, String username) {
        Subject subject = new Subject();
        subject.setName(request.name().trim());
        subject.setCode(request.code().trim().toUpperCase());
        subject.setCurriculumArea(request.curriculumArea() != null ? request.curriculumArea().trim() : null);
        Subject saved = subjectRepository.save(subject);
        return toSubjectResponse(saved);
    }

    @Transactional
    public AcademicSubjectResponse updateSubject(Long id, AcademicSubjectRequest request, String username) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException("La materia seleccionada no existe."));
        if (!subject.getCode().equalsIgnoreCase(request.code().trim())
                && subjectRepository.findByCodeIgnoreCase(request.code().trim()).isPresent()) {
            throw new BusinessException("Ya existe una materia con ese codigo.");
        }
        subject.setName(request.name().trim());
        subject.setCode(request.code().trim().toUpperCase());
        subject.setCurriculumArea(request.curriculumArea() != null ? request.curriculumArea().trim() : null);
        Subject saved = subjectRepository.save(subject);
        return toSubjectResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> listAreas() {
        return subjectRepository.findAll().stream()
                .map(Subject::getCurriculumArea)
                .filter(area -> area != null && !area.isBlank())
                .distinct()
                .sorted()
                .map(area -> Map.of("name", area))
                .toList();
    }

    private AcademicSubjectResponse toSubjectResponse(Subject subject) {
        return new AcademicSubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCode(),
                subject.getCurriculumArea());
    }
}
