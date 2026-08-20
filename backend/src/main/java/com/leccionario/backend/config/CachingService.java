package com.leccionario.backend.config;

import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.repository.RoleRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CachingService {

    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;

    @Cacheable(value = "roles", key = "#name")
    public Optional<Role> findRoleByName(String name) {
        return roleRepository.findByName(name);
    }

    @CacheEvict(value = "roles", allEntries = true)
    public void evictRoles() {
    }

    @Cacheable(value = "institutions", key = "#id")
    public Optional<Institution> findInstitutionById(Long id) {
        return institutionRepository.findById(id);
    }

    @Cacheable(value = "institutions", key = "'code_' + #code")
    public Optional<Institution> findInstitutionByCode(String code) {
        return institutionRepository.findByCodeIgnoreCase(code);
    }

    @CacheEvict(value = "institutions", allEntries = true)
    public void evictInstitutions() {
    }

    @Cacheable(value = "scheduleBlocks")
    public List<ScheduleBlock> findAllActiveBlocks() {
        return scheduleBlockRepository.findAll().stream()
                .filter(ScheduleBlock::isActive)
                .toList();
    }

    @CacheEvict(value = "scheduleBlocks", allEntries = true)
    public void evictScheduleBlocks() {
    }
}
