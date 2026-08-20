package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.AcademicYearRequest;
import com.leccionario.backend.academic.dto.AcademicYearResponse;
import com.leccionario.backend.academic.dto.SchoolDayRequest;
import com.leccionario.backend.academic.dto.SchoolDayResponse;
import com.leccionario.backend.academic.dto.SchoolModalityRequest;
import com.leccionario.backend.academic.dto.SchoolModalityResponse;
import com.leccionario.backend.academic.domain.AcademicYear;
import com.leccionario.backend.academic.domain.SchoolDay;
import com.leccionario.backend.academic.domain.SchoolModality;
import com.leccionario.backend.academic.repository.AcademicYearRepository;
import com.leccionario.backend.academic.repository.SchoolDayRepository;
import com.leccionario.backend.academic.repository.SchoolModalityRepository;
import com.leccionario.backend.common.exception.BusinessException;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AcademicCatalogService {

    private final AcademicYearRepository academicYearRepository;
    private final SchoolDayRepository schoolDayRepository;
    private final SchoolModalityRepository schoolModalityRepository;

    @Transactional(readOnly = true)
    public List<AcademicYearResponse> listAcademicYears() {
        return academicYearRepository.findAll().stream()
                .sorted(Comparator.comparingInt(AcademicYear::getYear).reversed())
                .map(y -> new AcademicYearResponse(y.getId(), y.getYear(), y.isActive()))
                .toList();
    }

    @Transactional
    public AcademicYearResponse createAcademicYear(AcademicYearRequest request, String username) {
        academicYearRepository.findByYear(request.year()).ifPresent(y -> {
            throw new BusinessException("Ya existe un ano lectivo registrado para el ano " + request.year() + ".");
        });
        AcademicYear entity = new AcademicYear();
        entity.setYear(request.year());
        entity.setActive(request.active());
        AcademicYear saved = academicYearRepository.save(entity);
        return new AcademicYearResponse(saved.getId(), saved.getYear(), saved.isActive());
    }

    @Transactional
    public AcademicYearResponse updateAcademicYear(Long id, AcademicYearRequest request, String username) {
        AcademicYear entity = academicYearRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Ano lectivo no encontrado."));
        if (entity.getYear() != request.year()
                && academicYearRepository.findByYear(request.year()).isPresent()) {
            throw new BusinessException("Ya existe un ano lectivo registrado para el ano " + request.year() + ".");
        }
        entity.setYear(request.year());
        entity.setActive(request.active());
        AcademicYear saved = academicYearRepository.save(entity);
        return new AcademicYearResponse(saved.getId(), saved.getYear(), saved.isActive());
    }

    @Transactional(readOnly = true)
    public List<SchoolDayResponse> listSchoolDays() {
        return schoolDayRepository.findAll().stream()
                .filter(SchoolDay::isActive)
                .sorted(Comparator.comparing(SchoolDay::getName))
                .map(d -> new SchoolDayResponse(d.getId(), d.getName(), d.isActive()))
                .toList();
    }

    @Transactional
    public SchoolDayResponse createSchoolDay(SchoolDayRequest request, String username) {
        schoolDayRepository.findByNameIgnoreCase(request.name().trim()).ifPresent(d -> {
            throw new BusinessException("Ya existe una jornada con ese nombre.");
        });
        SchoolDay entity = new SchoolDay();
        entity.setName(request.name().trim());
        entity.setActive(request.active());
        SchoolDay saved = schoolDayRepository.save(entity);
        return new SchoolDayResponse(saved.getId(), saved.getName(), saved.isActive());
    }

    @Transactional
    public SchoolDayResponse updateSchoolDay(Long id, SchoolDayRequest request, String username) {
        SchoolDay entity = schoolDayRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Jornada no encontrada."));
        if (!entity.getName().equalsIgnoreCase(request.name().trim())
                && schoolDayRepository.findByNameIgnoreCase(request.name().trim()).isPresent()) {
            throw new BusinessException("Ya existe una jornada con ese nombre.");
        }
        entity.setName(request.name().trim());
        entity.setActive(request.active());
        SchoolDay saved = schoolDayRepository.save(entity);
        return new SchoolDayResponse(saved.getId(), saved.getName(), saved.isActive());
    }

    @Transactional(readOnly = true)
    public List<SchoolModalityResponse> listSchoolModalities() {
        return schoolModalityRepository.findAll().stream()
                .filter(SchoolModality::isActive)
                .sorted(Comparator.comparing(SchoolModality::getName))
                .map(m -> new SchoolModalityResponse(m.getId(), m.getName(), m.isActive()))
                .toList();
    }

    @Transactional
    public SchoolModalityResponse createSchoolModality(SchoolModalityRequest request, String username) {
        schoolModalityRepository.findByNameIgnoreCase(request.name().trim()).ifPresent(m -> {
            throw new BusinessException("Ya existe una modalidad con ese nombre.");
        });
        SchoolModality entity = new SchoolModality();
        entity.setName(request.name().trim());
        entity.setActive(request.active());
        SchoolModality saved = schoolModalityRepository.save(entity);
        return new SchoolModalityResponse(saved.getId(), saved.getName(), saved.isActive());
    }

    @Transactional
    public SchoolModalityResponse updateSchoolModality(Long id, SchoolModalityRequest request, String username) {
        SchoolModality entity = schoolModalityRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Modalidad no encontrada."));
        if (!entity.getName().equalsIgnoreCase(request.name().trim())
                && schoolModalityRepository.findByNameIgnoreCase(request.name().trim()).isPresent()) {
            throw new BusinessException("Ya existe una modalidad con ese nombre.");
        }
        entity.setName(request.name().trim());
        entity.setActive(request.active());
        SchoolModality saved = schoolModalityRepository.save(entity);
        return new SchoolModalityResponse(saved.getId(), saved.getName(), saved.isActive());
    }
}
