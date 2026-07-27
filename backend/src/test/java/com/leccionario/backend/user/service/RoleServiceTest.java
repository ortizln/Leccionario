package com.leccionario.backend.user.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.dto.RoleCreateRequest;
import com.leccionario.backend.user.dto.RoleUpdateRequest;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoleServiceTest {

    private RoleRepository roleRepository;
    private UserRepository userRepository;
    private AuditService auditService;
    private RoleService service;

    @BeforeEach
    void setUp() {
        roleRepository = mock(RoleRepository.class);
        userRepository = mock(UserRepository.class);
        auditService = mock(AuditService.class);
        service = new RoleService(roleRepository, userRepository, auditService);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(roleRepository.findAll()).thenReturn(List.of());
        var result = service.findAll();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void create_savesNewRole() {
        when(roleRepository.findByName("ROLE_DOCENTE")).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenAnswer(inv -> {
            Role r = inv.getArgument(0);
            r.setName("ROLE_DOCENTE");
            return r;
        });
        RoleCreateRequest req = new RoleCreateRequest("DOCENTE", "Docente role", Set.of("ACADEMIC_VIEW"));
        var result = service.create(req, "admin");
        assertEquals("ROLE_DOCENTE", result.name());
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("ROLE"), any());
    }

    @Test
    void create_throwsWhenDuplicateName() {
        Role existing = new Role();
        existing.setName("ROLE_DOCENTE");
        when(roleRepository.findByName("ROLE_DOCENTE")).thenReturn(Optional.of(existing));
        RoleCreateRequest req = new RoleCreateRequest("DOCENTE", "Duplicate", Set.of());
        assertThrows(BusinessException.class, () -> service.create(req, "admin"));
    }

    @Test
    void update_modifiesRole() {
        Role existing = new Role();
        existing.setName("ROLE_DOCENTE");
        when(roleRepository.findByName("ROLE_DOCENTE")).thenReturn(Optional.of(existing));
        when(roleRepository.save(any())).thenReturn(existing);
        RoleUpdateRequest req = new RoleUpdateRequest("Updated desc", Set.of("ACADEMIC_VIEW", "GRADE_VIEW"));
        var result = service.update("DOCENTE", req, "admin");
        verify(auditService).log(eq("admin"), eq("UPDATE"), eq("ROLE"), any());
    }

    @Test
    void delete_removesRole() {
        Role role = new Role();
        role.setName("ROLE_DOCENTE");
        when(roleRepository.findByName("ROLE_DOCENTE")).thenReturn(Optional.of(role));
        when(userRepository.existsByRoles_Name("ROLE_DOCENTE")).thenReturn(false);
        service.delete("DOCENTE", "admin");
        verify(roleRepository).delete(role);
    }

    @Test
    void delete_throwsWhenAssigned() {
        Role role = new Role();
        role.setName("ROLE_DOCENTE");
        when(roleRepository.findByName("ROLE_DOCENTE")).thenReturn(Optional.of(role));
        when(userRepository.existsByRoles_Name("ROLE_DOCENTE")).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.delete("DOCENTE", "admin"));
    }
}
