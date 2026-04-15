package com.leccionario.backend.branding.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.branding.domain.InstitutionBranding;
import com.leccionario.backend.branding.domain.InstitutionCarouselSlide;
import com.leccionario.backend.branding.dto.BrandingAssetResponse;
import com.leccionario.backend.branding.dto.BrandingSlideRequest;
import com.leccionario.backend.branding.dto.BrandingSlideResponse;
import com.leccionario.backend.branding.dto.InstitutionBrandingRequest;
import com.leccionario.backend.branding.dto.InstitutionBrandingResponse;
import com.leccionario.backend.branding.dto.PublicInstitutionOptionResponse;
import com.leccionario.backend.branding.repository.InstitutionBrandingRepository;
import com.leccionario.backend.branding.repository.InstitutionCarouselSlideRepository;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class InstitutionBrandingService {

    private final InstitutionRepository institutionRepository;
    private final InstitutionBrandingRepository brandingRepository;
    private final InstitutionCarouselSlideRepository slideRepository;
    private final BrandingAssetService brandingAssetService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PublicInstitutionOptionResponse> findPublicInstitutions() {
        return institutionRepository.findAll().stream()
                .sorted(Comparator.comparing(Institution::getName))
                .map(institution -> new PublicInstitutionOptionResponse(
                        institution.getId(),
                        institution.getCode(),
                        institution.getName()))
                .toList();
    }

    @Transactional
    public InstitutionBrandingResponse findPublicBranding(String institutionCode) {
        Institution institution = resolveInstitution(institutionCode);
        return toResponse(institution, ensureBranding(institution), loadSlides(institution));
    }

    @Transactional
    public InstitutionBrandingResponse findByInstitution(Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institucion no encontrada."));
        return toResponse(institution, ensureBranding(institution), loadSlides(institution));
    }

    @Transactional
    public InstitutionBrandingResponse update(Long institutionId, InstitutionBrandingRequest request, String actor) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institucion no encontrada."));

        InstitutionBranding branding = ensureBranding(institution);
        applyBranding(branding, request);
        brandingRepository.save(branding);
        syncSlides(institution, request.slides() == null ? List.of() : request.slides());

        auditService.log(actor, "UPDATE", "BRANDING", "Configuracion institucional actualizada: " + institution.getName());
        return toResponse(institution, branding, loadSlides(institution));
    }

    @Transactional
    public BrandingAssetResponse uploadAsset(MultipartFile file, String actor) {
        String storedName = brandingAssetService.storeImage(file);
        String url = "/api/public/assets/" + storedName;
        auditService.log(actor, "UPLOAD", "BRANDING", "Archivo institucional cargado: " + storedName);
        return new BrandingAssetResponse(storedName, url);
    }

    private Institution resolveInstitution(String institutionCode) {
        if (institutionCode != null && !institutionCode.isBlank()) {
            return institutionRepository.findByCodeIgnoreCase(institutionCode.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("No existe una institucion con ese codigo."));
        }
        return institutionRepository.findAll().stream()
                .min(Comparator.comparing(Institution::getName))
                .orElseThrow(() -> new ResourceNotFoundException("No existen instituciones registradas."));
    }

    private InstitutionBranding ensureBranding(Institution institution) {
        InstitutionBranding branding = brandingRepository.findByInstitutionId(institution.getId())
                .orElseGet(() -> brandingRepository.save(defaultBranding(institution)));

        boolean changed = false;
        if (branding.getDisplayName() == null || branding.getDisplayName().isBlank()) {
            branding.setDisplayName(institution.getName());
            changed = true;
        }
        if (branding.getLoginBadgeText() == null || branding.getLoginBadgeText().isBlank()) {
            branding.setLoginBadgeText("Acceso institucional");
            changed = true;
        }
        if (branding.getLoginTitle() == null || branding.getLoginTitle().isBlank()) {
            branding.setLoginTitle("Bienvenido al Leccionario Digital");
            changed = true;
        }
        if (branding.getLoginSubtitle() == null || branding.getLoginSubtitle().isBlank()) {
            branding.setLoginSubtitle("Ingresa con tus credenciales para continuar con el registro y control academico.");
            changed = true;
        }
        if (branding.getLoginHelperText() == null || branding.getLoginHelperText().isBlank()) {
            branding.setLoginHelperText("Usa tu cuenta institucional.");
            changed = true;
        }
        if (branding.getShellTitle() == null || branding.getShellTitle().isBlank()) {
            branding.setShellTitle("Leccionario Estudiantil Digital");
            changed = true;
        }
        if (branding.getShellSubtitle() == null || branding.getShellSubtitle().isBlank()) {
            branding.setShellSubtitle("Control de leccionario, avance curricular y auditoria academica.");
            changed = true;
        }
        if (branding.getMobileTitle() == null || branding.getMobileTitle().isBlank()) {
            branding.setMobileTitle("Leccionario Mobile");
            changed = true;
        }
        if (branding.getMobileSubtitle() == null || branding.getMobileSubtitle().isBlank()) {
            branding.setMobileSubtitle("Consulta tu horario, registra novedades y cierra cada bloque desde una sola vista.");
            changed = true;
        }
        if (branding.getPrimaryColor() == null || branding.getPrimaryColor().isBlank()) {
            branding.setPrimaryColor("#586B3B");
            changed = true;
        }
        if (branding.getSecondaryColor() == null || branding.getSecondaryColor().isBlank()) {
            branding.setSecondaryColor("#7A5C3E");
            changed = true;
        }
        if (branding.getAccentColor() == null || branding.getAccentColor().isBlank()) {
            branding.setAccentColor("#E9DFC9");
            changed = true;
        }
        if (branding.getBackgroundColor() == null || branding.getBackgroundColor().isBlank()) {
            branding.setBackgroundColor("#F2EFE7");
            changed = true;
        }
        if (branding.getSurfaceColor() == null || branding.getSurfaceColor().isBlank()) {
            branding.setSurfaceColor("#FBF8F1");
            changed = true;
        }
        if (branding.getTextColor() == null || branding.getTextColor().isBlank()) {
            branding.setTextColor("#2E261B");
            changed = true;
        }
        if (branding.getContrastTextColor() == null || branding.getContrastTextColor().isBlank()) {
            branding.setContrastTextColor("#FFFFFF");
            changed = true;
        }
        if (branding.getMutedTextColor() == null || branding.getMutedTextColor().isBlank()) {
            branding.setMutedTextColor("#8C7D6B");
            changed = true;
        }

        return changed ? brandingRepository.save(branding) : branding;
    }

    private InstitutionBranding defaultBranding(Institution institution) {
        InstitutionBranding branding = new InstitutionBranding();
        branding.setInstitution(institution);
        branding.setDisplayName(institution.getName());
        branding.setLoginBadgeText("Acceso institucional");
        branding.setLoginTitle("Bienvenido al Leccionario Digital");
        branding.setLoginSubtitle("Ingresa con tus credenciales para continuar con el registro y control academico.");
        branding.setLoginHelperText("Usa tu cuenta institucional.");
        branding.setShellTitle("Leccionario Estudiantil Digital");
        branding.setShellSubtitle("Control de leccionario, avance curricular y auditoria academica.");
        branding.setMobileTitle("Leccionario Mobile");
        branding.setMobileSubtitle("Consulta tu horario, registra novedades y cierra cada bloque desde una sola vista.");
        branding.setPrimaryColor("#586B3B");
        branding.setSecondaryColor("#7A5C3E");
        branding.setAccentColor("#E9DFC9");
        branding.setBackgroundColor("#F2EFE7");
        branding.setSurfaceColor("#FBF8F1");
        branding.setTextColor("#2E261B");
        branding.setContrastTextColor("#FFFFFF");
        branding.setMutedTextColor("#8C7D6B");
        return branding;
    }

    private void applyBranding(InstitutionBranding branding, InstitutionBrandingRequest request) {
        branding.setDisplayName(request.displayName().trim());
        branding.setLoginBadgeText(request.loginBadgeText().trim());
        branding.setLoginTitle(request.loginTitle().trim());
        branding.setLoginSubtitle(request.loginSubtitle().trim());
        branding.setLoginHelperText(request.loginHelperText().trim());
        branding.setShellTitle(request.shellTitle().trim());
        branding.setShellSubtitle(request.shellSubtitle().trim());
        branding.setMobileTitle(request.mobileTitle().trim());
        branding.setMobileSubtitle(request.mobileSubtitle().trim());
        branding.setLogoUrl(blankToNull(request.logoUrl()));
        branding.setLoginLogoUrl(blankToNull(request.loginLogoUrl()));
        branding.setPrimaryColor(orDefaultColor(request.primaryColor(), "#586B3B"));
        branding.setSecondaryColor(orDefaultColor(request.secondaryColor(), "#7A5C3E"));
        branding.setAccentColor(orDefaultColor(request.accentColor(), "#E9DFC9"));
        branding.setBackgroundColor(orDefaultColor(request.backgroundColor(), "#F2EFE7"));
        branding.setSurfaceColor(orDefaultColor(request.surfaceColor(), "#FBF8F1"));
        branding.setTextColor(orDefaultColor(request.textColor(), "#2E261B"));
        branding.setContrastTextColor(orDefaultColor(request.contrastTextColor(), "#FFFFFF"));
        branding.setMutedTextColor(orDefaultColor(request.mutedTextColor(), "#8C7D6B"));
    }

    private void syncSlides(Institution institution, List<BrandingSlideRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            slideRepository.findByInstitutionIdOrderBySlideOrderAscIdAsc(institution.getId())
                    .forEach(slideRepository::delete);
            loadSlides(institution);
            return;
        }

        List<InstitutionCarouselSlide> existingSlides = slideRepository.findByInstitutionIdOrderBySlideOrderAscIdAsc(institution.getId());
        Map<Long, InstitutionCarouselSlide> existingById = existingSlides.stream()
                .filter(slide -> slide.getId() != null)
                .collect(Collectors.toMap(InstitutionCarouselSlide::getId, Function.identity()));

        List<InstitutionCarouselSlide> slidesToSave = requests.stream()
                .map(request -> {
                    InstitutionCarouselSlide slide = request.id() == null
                            ? new InstitutionCarouselSlide()
                            : existingById.get(request.id());
                    if (request.id() != null && slide == null) {
                        throw new BusinessException("Uno de los slides enviados ya no existe.");
                    }
                    slide.setInstitution(institution);
                    slide.setBadge(request.badge().trim());
                    slide.setTitle(request.title().trim());
                    slide.setDescription(request.description().trim());
                    slide.setImageUrl(request.imageUrl().trim());
                    slide.setSlideOrder(request.slideOrder());
                    slide.setActive(request.active());
                    return slide;
                })
                .toList();

        List<Long> requestIds = slidesToSave.stream()
                .map(InstitutionCarouselSlide::getId)
                .filter(Objects::nonNull)
                .toList();

        existingSlides.stream()
                .filter(slide -> slide.getId() != null && !requestIds.contains(slide.getId()))
                .forEach(slideRepository::delete);

        slideRepository.saveAll(slidesToSave);
    }

    private List<InstitutionCarouselSlide> loadSlides(Institution institution) {
        List<InstitutionCarouselSlide> slides = slideRepository.findByInstitutionIdOrderBySlideOrderAscIdAsc(institution.getId());
        if (slides.isEmpty()) {
            slides = slideRepository.saveAll(List.of(
                    defaultSlide(institution, 1, "Identidad", "Control academico con identidad institucional.",
                            "Registro diario, seguimiento curricular y supervision con evidencia centralizada.",
                            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"),
                    defaultSlide(institution, 2, "Comunidad", "Un entorno pensado para docentes y autoridades.",
                            "Consulta, auditoria y trazabilidad en una sola plataforma digital.",
                            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"),
                    defaultSlide(institution, 3, "Innovacion", "Seguimiento del proceso de ensenanza aprendizaje.",
                            "Informacion clara para rectorado, inspeccion, administracion y personal docente.",
                            "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80")));
        }
        return slides.stream()
                .sorted(Comparator.comparing(InstitutionCarouselSlide::getSlideOrder).thenComparing(InstitutionCarouselSlide::getId))
                .toList();
    }

    private InstitutionCarouselSlide defaultSlide(
            Institution institution,
            int order,
            String badge,
            String title,
            String description,
            String imageUrl) {
        InstitutionCarouselSlide slide = new InstitutionCarouselSlide();
        slide.setInstitution(institution);
        slide.setSlideOrder(order);
        slide.setBadge(badge);
        slide.setTitle(title);
        slide.setDescription(description);
        slide.setImageUrl(imageUrl);
        slide.setActive(true);
        return slide;
    }

    private InstitutionBrandingResponse toResponse(
            Institution institution,
            InstitutionBranding branding,
            List<InstitutionCarouselSlide> slides) {
        return new InstitutionBrandingResponse(
                institution.getId(),
                institution.getCode(),
                institution.getName(),
                branding.getDisplayName(),
                branding.getLoginBadgeText(),
                branding.getLoginTitle(),
                branding.getLoginSubtitle(),
                branding.getLoginHelperText(),
                branding.getShellTitle(),
                branding.getShellSubtitle(),
                branding.getMobileTitle(),
                branding.getMobileSubtitle(),
                branding.getLogoUrl(),
                branding.getLoginLogoUrl(),
                branding.getPrimaryColor(),
                branding.getSecondaryColor(),
                branding.getAccentColor(),
                branding.getBackgroundColor(),
                branding.getSurfaceColor(),
                branding.getTextColor(),
                branding.getContrastTextColor(),
                branding.getMutedTextColor(),
                slides.stream()
                        .map(slide -> new BrandingSlideResponse(
                                slide.getId(),
                                slide.getBadge(),
                                slide.getTitle(),
                                slide.getDescription(),
                                slide.getImageUrl(),
                                slide.getSlideOrder(),
                                slide.isActive()))
                        .toList());
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String orDefaultColor(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim().toUpperCase();
    }
}
