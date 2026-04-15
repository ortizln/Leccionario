package com.leccionario.backend.branding.repository;

import com.leccionario.backend.branding.domain.InstitutionCarouselSlide;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionCarouselSlideRepository extends JpaRepository<InstitutionCarouselSlide, Long> {

    List<InstitutionCarouselSlide> findByInstitutionIdOrderBySlideOrderAscIdAsc(Long institutionId);
}
