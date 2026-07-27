package com.leccionario.backend.branding.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.branding.domain.InstitutionBranding;
import com.leccionario.backend.branding.dto.InstitutionBrandingResponse;
import com.leccionario.backend.branding.repository.InstitutionBrandingRepository;
import com.leccionario.backend.branding.repository.InstitutionCarouselSlideRepository;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InstitutionBrandingServiceTest {

    private InstitutionRepository institutionRepository;
    private InstitutionBrandingRepository brandingRepository;
    private InstitutionCarouselSlideRepository slideRepository;
    private BrandingAssetService brandingAssetService;
    private AuditService auditService;
    private InstitutionBrandingService service;

    @BeforeEach
    void setUp() {
        institutionRepository = mock(InstitutionRepository.class);
        brandingRepository = mock(InstitutionBrandingRepository.class);
        slideRepository = mock(InstitutionCarouselSlideRepository.class);
        brandingAssetService = mock(BrandingAssetService.class);
        auditService = mock(AuditService.class);
        service = new InstitutionBrandingService(institutionRepository, brandingRepository,
                slideRepository, brandingAssetService, auditService);
    }

    @Test
    void findPublicInstitutions_delegates() {
        when(institutionRepository.findAll()).thenReturn(List.of());
        assertTrue(service.findPublicInstitutions().isEmpty());
    }

    @Test
    void findByInstitution_found() {
        Institution inst = new Institution();
        inst.setId(1L);
        inst.setName("Test");
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(inst));
        InstitutionBranding branding = new InstitutionBranding();
        branding.setId(1L);
        branding.setDisplayName("Test");
        branding.setLoginBadgeText("Acceso");
        branding.setLoginTitle("Title");
        branding.setLoginSubtitle("Sub");
        branding.setLoginHelperText("Helper");
        branding.setShellTitle("Shell");
        branding.setShellSubtitle("ShellSub");
        branding.setMobileTitle("Mobile");
        branding.setMobileSubtitle("MobileSub");
        when(brandingRepository.findByInstitutionId(1L)).thenReturn(Optional.of(branding));
        when(brandingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(slideRepository.findByInstitutionIdOrderBySlideOrderAscIdAsc(1L)).thenReturn(List.of());
        var result = service.findByInstitution(1L);
        assertNotNull(result);
    }

    @Test
    void findByInstitution_notFound_throws() {
        when(institutionRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(com.leccionario.backend.common.exception.ResourceNotFoundException.class,
                () -> service.findByInstitution(1L));
    }
}
