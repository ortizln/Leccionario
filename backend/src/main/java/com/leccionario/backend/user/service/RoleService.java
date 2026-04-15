package com.leccionario.backend.user.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.user.domain.PermissionCode;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.user.dto.RoleCreateRequest;
import com.leccionario.backend.user.dto.RoleResponse;
import com.leccionario.backend.user.dto.RoleUpdateRequest;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparing(Role::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RoleResponse create(RoleCreateRequest request, String actor) {
        String normalizedName = RoleDefaults.normalize(request.name());
        if (roleRepository.findByName(normalizedName).isPresent()) {
            throw new BusinessException("Ya existe un perfil con ese nombre");
        }

        Role role = new Role();
        role.setName(normalizedName);
        role.setDescription(request.description());
        role.setPermissions(parsePermissions(request.permissions()));

        Role saved = roleRepository.save(role);
        auditService.log(actor, "CREATE", "ROLE", "Perfil creado: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public RoleResponse update(String roleName, RoleUpdateRequest request, String actor) {
        String normalizedName = RoleDefaults.normalize(roleName);
        Role role = roleRepository.findByName(normalizedName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        role.setDescription(request.description());
        role.setPermissions(parsePermissions(request.permissions()));

        Role saved = roleRepository.save(role);
        auditService.log(actor, "UPDATE", "ROLE", "Perfil actualizado: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public void delete(String roleName, String actor) {
        String normalizedName = RoleDefaults.normalize(roleName);
        Role role = roleRepository.findByName(normalizedName)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        if (userRepository.existsByRoles_Name(normalizedName)) {
            throw new BusinessException("No se puede eliminar un perfil asignado a usuarios");
        }

        roleRepository.delete(role);
        auditService.log(actor, "DELETE", "ROLE", "Perfil eliminado: " + normalizedName);
    }

    private Set<PermissionCode> parsePermissions(Set<String> permissions) {
        return permissions.isEmpty()
                ? EnumSet.noneOf(PermissionCode.class)
                : permissions.stream().map(PermissionCode::valueOf).collect(java.util.stream.Collectors.toSet());
    }

    private RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getName(),
                role.getDescription(),
                role.getPermissions().stream().map(Enum::name).collect(java.util.stream.Collectors.toCollection(java.util.TreeSet::new)));
    }
}
