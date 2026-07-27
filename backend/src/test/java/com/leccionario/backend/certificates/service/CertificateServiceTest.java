package com.leccionario.backend.certificates.service;

import com.leccionario.backend.certificates.domain.Certificate;
import com.leccionario.backend.certificates.domain.CertificateTemplate;
import com.leccionario.backend.certificates.repository.CertificateRepository;
import com.leccionario.backend.certificates.repository.CertificateDetailRepository;
import com.leccionario.backend.certificates.repository.CertificateTemplateRepository;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.evaluation.repository.PeriodGradeRepository;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CertificateServiceTest {

    private CertificateRepository certificateRepository;
    private CertificateDetailRepository certificateDetailRepository;
    private CertificateTemplateRepository templateRepository;
    private StudentRepository studentRepository;
    private PeriodGradeRepository periodGradeRepository;
    private CertificateService service;

    @BeforeEach
    void setUp() {
        certificateRepository = mock(CertificateRepository.class);
        certificateDetailRepository = mock(CertificateDetailRepository.class);
        templateRepository = mock(CertificateTemplateRepository.class);
        studentRepository = mock(StudentRepository.class);
        periodGradeRepository = mock(PeriodGradeRepository.class);
        service = new CertificateService(certificateRepository, certificateDetailRepository,
            templateRepository, studentRepository, periodGradeRepository);
    }

    @Test
    void getTemplates_delegatesToRepository() {
        when(templateRepository.findByInstitutionId(1L)).thenReturn(List.of());
        assertTrue(service.getTemplates(1L).isEmpty());
    }

    @Test
    void getCertificate_found() {
        Certificate cert = buildCertificate(1L);
        when(certificateRepository.findById(1L)).thenReturn(Optional.of(cert));
        assertNotNull(service.getCertificate(1L));
    }

    @Test
    void getCertificate_notFound_throws() {
        when(certificateRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getCertificate(1L));
    }

    @Test
    void getByNumber_found() {
        Certificate cert = buildCertificate(1L);
        cert.setCertificateNumber("CERT-001");
        when(certificateRepository.findByCertificateNumber("CERT-001")).thenReturn(Optional.of(cert));
        assertNotNull(service.getByNumber("CERT-001"));
    }

    @Test
    void getByNumber_notFound_throws() {
        when(certificateRepository.findByCertificateNumber("MISSING")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getByNumber("MISSING"));
    }

    @Test
    void getByStudent_delegatesToRepository() {
        when(certificateRepository.findByStudentId(1L)).thenReturn(List.of());
        assertTrue(service.getByStudent(1L).isEmpty());
    }

    @Test
    void getByPeriod_delegatesToRepository() {
        when(certificateRepository.findByAcademicPeriodId(1L)).thenReturn(List.of());
        assertTrue(service.getByPeriod(1L).isEmpty());
    }

    @Test
    void getStats_returnsMap() {
        when(certificateRepository.findByInstitutionId(1L)).thenReturn(List.of(new Certificate()));
        when(certificateRepository.countIssuedByInstitution(1L)).thenReturn(1L);
        var stats = service.getStats(1L);
        assertNotNull(stats);
    }

    private Certificate buildCertificate(Long id) {
        Institution inst = new Institution();
        inst.setId(1L);

        com.leccionario.backend.user.domain.User user = new com.leccionario.backend.user.domain.User();
        user.setFirstName("Juan");
        user.setLastName("Perez");

        Student student = new Student();
        student.setId(1L);
        student.setEnrollmentNumber("E-001");
        student.setUser(user);

        CertificateTemplate template = new CertificateTemplate();
        template.setId(1L);
        template.setName("Constancia");
        template.setTemplateType("CONSTANCIA");
        template.setHeaderText("Header");
        template.setFooterText("Footer");

        Certificate cert = new Certificate();
        cert.setId(id);
        cert.setInstitution(inst);
        cert.setStudent(student);
        cert.setTemplate(template);
        cert.setCertificateNumber("CERT-" + id);
        cert.setStatus("PENDING");
        return cert;
    }
}
