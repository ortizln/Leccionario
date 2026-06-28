package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.DemeritCategory;
import com.leccionario.backend.demerit.domain.DemeritFalta;
import com.leccionario.backend.demerit.dto.DemeritFaltaRequest;
import com.leccionario.backend.demerit.dto.DemeritFaltaResponse;
import com.leccionario.backend.demerit.repository.DemeritCategoryRepository;
import com.leccionario.backend.demerit.repository.DemeritFaltaRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DemeritFaltaService {

    private final DemeritFaltaRepository repository;
    private final DemeritCategoryRepository categoryRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<DemeritFaltaResponse> findAll() {
        return repository.findAll().stream()
                .sorted(Comparator
                        .comparing((DemeritFalta f) -> f.getCategory().getCode())
                        .thenComparing(DemeritFalta::getCode))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DemeritFaltaResponse> findActiveOptions() {
        return repository.findByActiveTrue().stream()
                .sorted(Comparator
                        .comparing((DemeritFalta f) -> f.getCategory().getCode())
                        .thenComparing(DemeritFalta::getCode))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DemeritFaltaResponse> findByCategory(Long categoryId) {
        return repository.findByCategoryIdAndActiveTrue(categoryId).stream()
                .sorted(Comparator.comparing(DemeritFalta::getCode))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DemeritFaltaResponse create(DemeritFaltaRequest request, String actor) {
        DemeritCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada"));
        validateUniqueCode(request.categoryId(), request.code(), null);
        DemeritFalta falta = new DemeritFalta();
        apply(falta, request, category);
        DemeritFalta saved = repository.save(falta);
        auditService.log(actor, "CREATE", "DEMERIT_FALTA", "Falta creada ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public DemeritFaltaResponse update(Long id, DemeritFaltaRequest request, String actor) {
        DemeritFalta falta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Falta no encontrada"));
        DemeritCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada"));
        validateUniqueCode(request.categoryId(), request.code(), id);
        apply(falta, request, category);
        DemeritFalta saved = repository.save(falta);
        auditService.log(actor, "UPDATE", "DEMERIT_FALTA", "Falta actualizada ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, String actor) {
        DemeritFalta falta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Falta no encontrada"));
        repository.delete(falta);
        auditService.log(actor, "DELETE", "DEMERIT_FALTA", "Falta eliminada ID " + id);
    }

    private void apply(DemeritFalta falta, DemeritFaltaRequest request, DemeritCategory category) {
        falta.setCategory(category);
        falta.setCode(request.code().trim());
        falta.setDescription(request.description().trim());
        falta.setScore(request.score());
        falta.setSeverity(request.severity() != null
                ? DemeritFalta.FaltaSeverity.valueOf(request.severity()) : DemeritFalta.FaltaSeverity.MEDIA);
        falta.setRequiresObservation(request.requiresObservation());
        falta.setRequiresEvidence(request.requiresEvidence());
        falta.setRequiresRepresentative(request.requiresRepresentative());
        falta.setActive(request.active());
    }

    private void validateUniqueCode(Long categoryId, String code, Long currentId) {
        if (code == null || code.isBlank()) {
            throw new BusinessException("El codigo es obligatorio.");
        }
        repository.findByCategoryIdAndCodeIgnoreCase(categoryId, code.trim())
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe una falta con ese codigo en la categoria.");
                });
    }

    private DemeritFaltaResponse toResponse(DemeritFalta falta) {
        return new DemeritFaltaResponse(
                falta.getId(),
                falta.getCategory().getId(),
                falta.getCategory().getName(),
                falta.getCategory().getCode(),
                falta.getCode(),
                falta.getDescription(),
                falta.getScore(),
                falta.getSeverity().name(),
                falta.isRequiresObservation(),
                falta.isRequiresEvidence(),
                falta.isRequiresRepresentative(),
                falta.isActive());
    }
}
