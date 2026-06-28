package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.DemeritCategory;
import com.leccionario.backend.demerit.dto.DemeritCategoryRequest;
import com.leccionario.backend.demerit.dto.DemeritCategoryResponse;
import com.leccionario.backend.demerit.repository.DemeritCategoryRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DemeritCategoryService {

    private final DemeritCategoryRepository repository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<DemeritCategoryResponse> findAll() {
        return repository.findAll().stream()
                .sorted(Comparator
                        .comparing(DemeritCategory::isActive).reversed()
                        .thenComparing(DemeritCategory::getDisplayOrder)
                        .thenComparing(DemeritCategory::getCode))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DemeritCategoryResponse create(DemeritCategoryRequest request, String actor) {
        validateUniqueCode(request.code(), null);
        DemeritCategory cat = new DemeritCategory();
        apply(cat, request);
        DemeritCategory saved = repository.save(cat);
        auditService.log(actor, "CREATE", "DEMERIT_CATEGORY", "Categoria de demerito creada ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public DemeritCategoryResponse update(Long id, DemeritCategoryRequest request, String actor) {
        DemeritCategory cat = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria de demerito no encontrada"));
        validateUniqueCode(request.code(), id);
        apply(cat, request);
        DemeritCategory saved = repository.save(cat);
        auditService.log(actor, "UPDATE", "DEMERIT_CATEGORY", "Categoria de demerito actualizada ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, String actor) {
        DemeritCategory cat = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria de demerito no encontrada"));
        repository.delete(cat);
        auditService.log(actor, "DELETE", "DEMERIT_CATEGORY", "Categoria de demerito eliminada ID " + id);
    }

    private void apply(DemeritCategory cat, DemeritCategoryRequest request) {
        cat.setCode(request.code().trim());
        cat.setName(request.name().trim());
        cat.setDescription(request.description() != null ? request.description().trim() : null);
        cat.setDisplayOrder(request.displayOrder());
        cat.setActive(request.active());
    }

    private void validateUniqueCode(String code, Long currentId) {
        if (code == null || code.isBlank()) {
            throw new BusinessException("El codigo es obligatorio.");
        }
        repository.findByCodeIgnoreCase(code.trim())
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe una categoria con ese codigo.");
                });
    }

    private DemeritCategoryResponse toResponse(DemeritCategory cat) {
        return new DemeritCategoryResponse(
                cat.getId(), cat.getCode(), cat.getName(),
                cat.getDescription(), cat.getDisplayOrder(), cat.isActive());
    }
}
