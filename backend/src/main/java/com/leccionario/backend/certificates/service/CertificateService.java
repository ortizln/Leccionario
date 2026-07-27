package com.leccionario.backend.certificates.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.certificates.domain.Certificate;
import com.leccionario.backend.certificates.domain.CertificateDetail;
import com.leccionario.backend.certificates.domain.CertificateTemplate;
import com.leccionario.backend.certificates.dto.CertificateRequest;
import com.leccionario.backend.certificates.dto.CertificateResponse;
import com.leccionario.backend.certificates.dto.CertificateTemplateResponse;
import com.leccionario.backend.certificates.repository.CertificateDetailRepository;
import com.leccionario.backend.certificates.repository.CertificateRepository;
import com.leccionario.backend.certificates.repository.CertificateTemplateRepository;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.evaluation.domain.PeriodGrade;
import com.leccionario.backend.evaluation.repository.PeriodGradeRepository;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.repository.StudentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CertificateDetailRepository certificateDetailRepository;
    private final CertificateTemplateRepository templateRepository;
    private final StudentRepository studentRepository;
    private final PeriodGradeRepository periodGradeRepository;

    // --- Templates ---

    @Transactional(readOnly = true)
    public List<CertificateTemplateResponse> getTemplates(Long institutionId) {
        return templateRepository.findByInstitutionId(institutionId)
                .stream().map(this::toTemplateResponse).toList();
    }

    // --- Certificates ---

    @Transactional
    public CertificateResponse generate(CertificateRequest request, Long institutionId, String username) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        CertificateTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificate template not found"));

        Certificate cert = new Certificate();
        Institution inst = new Institution();
        inst.setId(institutionId);
        cert.setInstitution(inst);
        cert.setTemplate(template);
        cert.setStudent(student);

        if (request.getCourseId() != null) {
            Course course = new Course();
            course.setId(request.getCourseId());
            cert.setCourse(course);
        }
        if (request.getAcademicPeriodId() != null) {
            AcademicPeriod period = new AcademicPeriod();
            period.setId(request.getAcademicPeriodId());
            cert.setAcademicPeriod(period);
        }

        cert.setCertificateNumber(generateCertificateNumber(institutionId));
        cert.setObservations(request.getObservations());
        cert.setIssuedBy(username);

        Certificate saved = certificateRepository.save(cert);

        // Populate details based on template type
        List<CertificateDetail> details = new ArrayList<>();
        if (Boolean.TRUE.equals(template.getRequiresGrades()) && request.getAcademicPeriodId() != null) {
            details = populateGradeDetails(saved, request.getStudentId(), request.getAcademicPeriodId());
        }
        for (CertificateDetail d : details) {
            d.setCertificate(saved);
            certificateDetailRepository.save(d);
        }

        return toCertificateResponse(saved, details);
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificate(Long id) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        List<CertificateDetail> details = certificateDetailRepository.findByCertificateId(id);
        return toCertificateResponse(cert, details);
    }

    @Transactional(readOnly = true)
    public CertificateResponse getByNumber(String number) {
        Certificate cert = certificateRepository.findByCertificateNumber(number)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        List<CertificateDetail> details = certificateDetailRepository.findByCertificateId(cert.getId());
        return toCertificateResponse(cert, details);
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getByStudent(Long studentId) {
        return certificateRepository.findByStudentId(studentId)
                .stream()
                .map(c -> {
                    List<CertificateDetail> d = certificateDetailRepository.findByCertificateId(c.getId());
                    return toCertificateResponse(c, d);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getByPeriod(Long periodId) {
        return certificateRepository.findByAcademicPeriodId(periodId)
                .stream()
                .map(c -> {
                    List<CertificateDetail> d = certificateDetailRepository.findByCertificateId(c.getId());
                    return toCertificateResponse(c, d);
                })
                .toList();
    }

    @Transactional
    public CertificateResponse issue(Long certificateId, String username) {
        Certificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        cert.setStatus("ISSUED");
        cert.setIssuedAt(OffsetDateTime.now());
        cert.setValidUntil(LocalDate.now().plusDays(90));
        Certificate saved = certificateRepository.save(cert);
        List<CertificateDetail> details = certificateDetailRepository.findByCertificateId(saved.getId());
        return toCertificateResponse(saved, details);
    }

    @Transactional
    public CertificateResponse revoke(Long certificateId, String username) {
        Certificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        cert.setStatus("REVOKED");
        Certificate saved = certificateRepository.save(cert);
        List<CertificateDetail> details = certificateDetailRepository.findByCertificateId(saved.getId());
        return toCertificateResponse(saved, details);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats(Long institutionId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = certificateRepository.findByInstitutionId(institutionId).size();
        long issued = certificateRepository.countIssuedByInstitution(institutionId);
        stats.put("total", total);
        stats.put("issued", issued);
        stats.put("draft", total - issued);
        return stats;
    }

    // --- Helpers ---

    private String generateCertificateNumber(Long institutionId) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randPart = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        return "CERT-" + datePart + "-" + randPart;
    }

    private List<CertificateDetail> populateGradeDetails(Certificate cert, Long studentId, Long periodId) {
        List<PeriodGrade> grades = periodGradeRepository.findByStudentIdAndAcademicPeriodId(studentId, periodId);
        List<CertificateDetail> details = new ArrayList<>();
        for (PeriodGrade pg : grades) {
            CertificateDetail d = new CertificateDetail();
            d.setSubjectName(pg.getSubject().getName());
            d.setScore(pg.getAverageScore());
            d.setStatus(pg.getStatus());
            d.setObservation(pg.getTeacherNotes());
            details.add(d);
        }
        return details;
    }

    private CertificateResponse toCertificateResponse(Certificate c, List<CertificateDetail> details) {
        CertificateResponse r = new CertificateResponse();
        r.setId(c.getId());
        r.setInstitutionId(c.getInstitution().getId());
        r.setTemplateId(c.getTemplate().getId());
        r.setTemplateName(c.getTemplate().getName());
        r.setTemplateType(c.getTemplate().getTemplateType());
        r.setStudentId(c.getStudent().getId());
        r.setStudentName(c.getStudent().getUser().getFirstName() + " " + c.getStudent().getUser().getLastName());
        r.setEnrollmentNumber(c.getStudent().getEnrollmentNumber());
        if (c.getCourse() != null) {
            r.setCourseId(c.getCourse().getId());
            r.setCourseName(c.getCourse().getName());
        }
        if (c.getAcademicPeriod() != null) {
            r.setAcademicPeriodId(c.getAcademicPeriod().getId());
            r.setAcademicPeriodName(c.getAcademicPeriod().getName());
        }
        r.setCertificateNumber(c.getCertificateNumber());
        r.setStatus(c.getStatus());
        r.setIssuedAt(c.getIssuedAt());
        r.setIssuedBy(c.getIssuedBy());
        r.setValidUntil(c.getValidUntil());
        r.setObservations(c.getObservations());
        r.setHeaderText(c.getTemplate().getHeaderText());
        r.setFooterText(c.getTemplate().getFooterText());
        r.setCreatedAt(c.getCreatedAt());
        r.setDetails(details.stream().map(d -> {
            CertificateResponse.CertificateDetailResponse dr = new CertificateResponse.CertificateDetailResponse();
            dr.setId(d.getId());
            dr.setSubjectName(d.getSubjectName());
            dr.setScore(d.getScore());
            dr.setStatus(d.getStatus());
            dr.setObservation(d.getObservation());
            return dr;
        }).toList());
        return r;
    }

    private CertificateTemplateResponse toTemplateResponse(CertificateTemplate t) {
        CertificateTemplateResponse r = new CertificateTemplateResponse();
        r.setId(t.getId());
        r.setInstitutionId(t.getInstitution().getId());
        r.setName(t.getName());
        r.setTemplateType(t.getTemplateType());
        r.setDescription(t.getDescription());
        r.setHeaderText(t.getHeaderText());
        r.setFooterText(t.getFooterText());
        r.setRequiresGrades(t.getRequiresGrades());
        r.setRequiresConduct(t.getRequiresConduct());
        r.setActive(t.getActive());
        return r;
    }
}
