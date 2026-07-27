package com.leccionario.backend.user.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.dto.UserRequest;
import com.leccionario.backend.user.dto.UserUpdateRequest;
import com.leccionario.backend.user.mapper.UserMapper;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private InstitutionRepository institutionRepository;
    private PasswordEncoder passwordEncoder;
    private UserMapper userMapper;
    private TeacherRepository teacherRepository;
    private AuditService auditService;
    private UserService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        institutionRepository = mock(InstitutionRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        userMapper = mock(UserMapper.class);
        teacherRepository = mock(TeacherRepository.class);
        auditService = mock(AuditService.class);
        service = new UserService(userRepository, roleRepository, institutionRepository,
            passwordEncoder, userMapper, teacherRepository, auditService);
    }

    private User makeUser() {
        User u = new User();
        u.setId(1L);
        u.setUsername("testuser");
        u.setEmail("test@test.com");
        u.setFirstName("Test");
        u.setLastName("User");
        u.setEnabled(true);
        return u;
    }

    @Test
    void create_savesAndAudits() {
        Institution inst = new Institution();
        inst.setId(1L);
        Role role = new Role();
        role.setName("ROLE_DOCENTE");
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(inst));
        when(roleRepository.findByName("ROLE_DOCENTE")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("pass123")).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(userMapper.toResponse(any())).thenReturn(
            new com.leccionario.backend.user.dto.UserResponse(1L, "test", "test@test.com", "0102030406",
                "Test", "User", true, 1L, "Inst", null, Set.of("ROLE_DOCENTE")));
        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.empty());

        UserRequest req = new UserRequest("test", "test@test.com", "pass123", "0102030406", "Test", "User", 1L, true, Set.of("DOCENTE"));
        var result = service.create(req, "admin");
        assertNotNull(result);
        verify(auditService).log(eq("admin"), eq("CREATE"), eq("USER"), any());
    }

    @Test
    void update_throwsWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        UserUpdateRequest req = new UserUpdateRequest("test", "test@test.com", null, "0102030406", "Test", "User", 1L, true, Set.of("DOCENTE"));
        assertThrows(ResourceNotFoundException.class, () -> service.update(99L, req, "admin"));
    }

    @Test
    void findAll_delegatesToRepository() {
        when(userRepository.findAll()).thenReturn(List.of());
        List<?> result = service.findAll();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void resetPassword_encodesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded_new");
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(any())).thenReturn(
            new com.leccionario.backend.user.dto.UserResponse(1L, "test", "test@test.com", null,
                "Test", "User", true, 1L, "Inst", null, Set.of()));
        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.empty());
        var req = new com.leccionario.backend.user.dto.UserPasswordResetRequest("newpass");
        service.resetPassword(1L, req, "admin");
        verify(passwordEncoder).encode("newpass");
        verify(auditService).log(eq("admin"), eq("RESET_PASSWORD"), eq("USER"), any());
    }
}
