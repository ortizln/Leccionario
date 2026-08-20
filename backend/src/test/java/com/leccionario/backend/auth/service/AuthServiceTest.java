package com.leccionario.backend.auth.service;

import com.leccionario.backend.auth.dto.AuthRequest;
import com.leccionario.backend.auth.dto.AuthResponse;
import com.leccionario.backend.security.JwtService;
import com.leccionario.backend.user.domain.Institution;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setName("ROLE_DOCENTE");

        Institution institution = new Institution();
        institution.setId(1L);
        institution.setCode("INST001");
        institution.setName("Institution Test");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encoded_password");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@test.com");
        testUser.setEnabled(true);
        testUser.setInstitution(institution);
        testUser.setRoles(Set.of(testRole));
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        AuthRequest request = new AuthRequest("testuser", "password123");

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "testuser", "password123", Collections.emptyList());

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any())).thenReturn("access-token-123");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token-456");
        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.empty());

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token-123", response.token());
        assertEquals("refresh-token-456", response.refreshToken());
        assertEquals("testuser", response.username());
        assertEquals("Test User", response.fullName());
        assertEquals("Docente", response.primaryRole());
        assertEquals(1L, response.institutionId());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void refreshToken_withValidToken_returnsNewTokens() {
        String refreshToken = "valid-refresh-token";
        when(jwtService.isRefreshToken(refreshToken)).thenReturn(true);
        when(jwtService.isTokenExpired(refreshToken)).thenReturn(false);
        when(jwtService.extractUsername(refreshToken)).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any())).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("new-refresh-token");
        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.empty());

        AuthResponse response = authService.refreshToken(refreshToken);

        assertNotNull(response);
        assertEquals("new-access-token", response.token());
        assertEquals("new-refresh-token", response.refreshToken());
        assertEquals("testuser", response.username());
    }

    @Test
    void refreshToken_withExpiredToken_throwsException() {
        String expiredToken = "expired-refresh-token";
        when(jwtService.isRefreshToken(expiredToken)).thenReturn(true);
        when(jwtService.isTokenExpired(expiredToken)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.refreshToken(expiredToken));
    }

    @Test
    void refreshToken_withInvalidToken_throwsException() {
        String invalidToken = "not-a-refresh-token";
        when(jwtService.isRefreshToken(invalidToken)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.refreshToken(invalidToken));
    }

    @Test
    void refreshToken_withNonExistentUser_throwsException() {
        String refreshToken = "valid-refresh-token";
        when(jwtService.isRefreshToken(refreshToken)).thenReturn(true);
        when(jwtService.isTokenExpired(refreshToken)).thenReturn(false);
        when(jwtService.extractUsername(refreshToken)).thenReturn("nonexistent");
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.refreshToken(refreshToken));
    }

    @Test
    void login_withAdminRole_returnsAllPermissions() {
        Role adminRole = new Role();
        adminRole.setName("ROLE_ADMINISTRADOR");
        testUser.setRoles(Set.of(adminRole));

        AuthRequest request = new AuthRequest("testuser", "password123");
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "testuser", "password123", Collections.emptyList());

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");
        when(teacherRepository.findByUserId(1L)).thenReturn(Optional.empty());

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertFalse(response.permissions().isEmpty());
        assertTrue(response.primaryRole().equals("Administrador"));
    }
}
