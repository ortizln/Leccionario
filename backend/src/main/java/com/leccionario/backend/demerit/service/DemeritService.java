package com.leccionario.backend.demerit.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.Demerit;
import com.leccionario.backend.demerit.dto.DemeritOptionResponse;
import com.leccionario.backend.demerit.dto.DemeritRequest;
import com.leccionario.backend.demerit.dto.DemeritResponse;
import com.leccionario.backend.demerit.repository.DemeritRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class DemeritService {

    private final DemeritRepository demeritRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<DemeritResponse> findAll() {
        return demeritRepository.findAll().stream()
                .sorted(Comparator
                        .comparing(Demerit::isActive).reversed()
                        .thenComparing(demerit -> safe(demerit.getCategory()))
                        .thenComparing(demerit -> safe(demerit.getCode()))
                        .thenComparing(demerit -> safe(demerit.getDescription())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DemeritOptionResponse> findActiveOptions() {
        return demeritRepository.findAll().stream()
                .filter(Demerit::isActive)
                .sorted(Comparator
                        .comparing(Demerit::getCategory)
                        .thenComparing(demerit -> safe(demerit.getCode()))
                        .thenComparing(Demerit::getDescription))
                .map(this::toOption)
                .toList();
    }

    @Transactional
    public DemeritResponse create(DemeritRequest request, String actor) {
        validateUniqueCode(request.code(), null);
        Demerit demerit = new Demerit();
        apply(demerit, request);
        Demerit saved = demeritRepository.save(demerit);
        auditService.log(actor, "CREATE", "DEMERIT", "Demerito creado ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public DemeritResponse update(Long id, DemeritRequest request, String actor) {
        Demerit demerit = demeritRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demerito no encontrado"));
        validateUniqueCode(request.code(), id);
        apply(demerit, request);
        Demerit saved = demeritRepository.save(demerit);
        auditService.log(actor, "UPDATE", "DEMERIT", "Demerito actualizado ID " + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, String actor) {
        Demerit demerit = demeritRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demerito no encontrado"));
        demeritRepository.delete(demerit);
        auditService.log(actor, "DELETE", "DEMERIT", "Demerito eliminado ID " + id);
    }

    @Transactional(readOnly = true)
    public Demerit requireById(Long id) {
        return demeritRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demerito no encontrado"));
    }

    @Transactional(readOnly = true)
    public byte[] exportTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("demeritos");
        ExcelSupport.writeHeaders(sheet, "code", "category", "description", "score", "active");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("A1");
        sample.createCell(1).setCellValue("Convivencia y disciplina");
        sample.createCell(2).setCellValue("Hablar en formacion sin autorizacion");
        sample.createCell(3).setCellValue(2);
        sample.createCell(4).setCellValue("true");
        ExcelSupport.autoSize(sheet, 5);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional
    public ImportSummaryResponse importExcel(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 5)) {
                continue;
            }
            total++;
            int excelRow = rowIndex + 1;
            try {
                upsertImportedDemerit(
                        ExcelSupport.getString(row, 0),
                        ExcelSupport.getString(row, 1),
                        ExcelSupport.getString(row, 2),
                        ExcelSupport.getShort(row, 3, (short) 2),
                        ExcelSupport.getBoolean(row, 4, true),
                        actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }
        return new ImportSummaryResponse(
                "DEMERITS",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Demeritos importados correctamente."
                        : "Importacion completada con observaciones en deméritos.",
                errors);
    }

    private void apply(Demerit demerit, DemeritRequest request) {
        demerit.setCode(trimToNull(request.code()));
        demerit.setCategory(request.category().trim());
        demerit.setDescription(request.description().trim());
        demerit.setScore(request.score());
        demerit.setActive(request.active());
    }

    private void validateUniqueCode(String rawCode, Long currentId) {
        String code = trimToNull(rawCode);
        if (code == null) {
            return;
        }
        demeritRepository.findByCodeIgnoreCase(code)
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe un demérito con ese código.");
                });
    }

    private DemeritResponse toResponse(Demerit demerit) {
        return new DemeritResponse(
                demerit.getId(),
                demerit.getCode(),
                demerit.getCategory(),
                demerit.getDescription(),
                demerit.getScore(),
                demerit.isActive());
    }

    private DemeritOptionResponse toOption(Demerit demerit) {
        return new DemeritOptionResponse(
                demerit.getId(),
                demerit.getCode(),
                demerit.getCategory(),
                demerit.getDescription(),
                demerit.getScore());
    }

    private void upsertImportedDemerit(
            String code,
            String category,
            String description,
            short score,
            boolean active,
            String actor) {
        String normalizedCode = trimToNull(code);
        Demerit demerit = normalizedCode == null
                ? new Demerit()
                : demeritRepository.findByCodeIgnoreCase(normalizedCode).orElseGet(Demerit::new);
        boolean isNew = demerit.getId() == null;
        if (category == null || category.trim().isBlank()) {
            throw new BusinessException("La categoria es obligatoria.");
        }
        if (description == null || description.trim().isBlank()) {
            throw new BusinessException("La descripcion es obligatoria.");
        }
        demerit.setCode(normalizedCode);
        demerit.setCategory(category.trim());
        demerit.setDescription(description.trim());
        demerit.setScore(score);
        demerit.setActive(active);
        Demerit saved = demeritRepository.save(demerit);
        auditService.log(actor, isNew ? "CREATE_DEMERIT" : "UPDATE_DEMERIT", "DEMERIT", "Demerito importado ID " + saved.getId());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
