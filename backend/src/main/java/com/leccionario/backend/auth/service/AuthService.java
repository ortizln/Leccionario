package com.leccionario.backend.auth.service;

import com.leccionario.backend.auth.dto.AuthRequest;
import com.leccionario.backend.auth.dto.AuthResponse;
import com.leccionario.backend.security.JwtService;
import com.leccionario.backend.user.domain.PermissionCode;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.util.EnumSet;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;

    public AuthResponse login(AuthRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        UserDetails principal = (UserDetails) auth.getPrincipal();
        var user = userRepository.findByUsername(principal.getUsername()).orElseThrow();
        var roles = user.getRoles().stream().map(role -> role.getName()).collect(java.util.stream.Collectors.toSet());
        var permissionCodes = roles.contains(RoleDefaults.ADMINISTRADOR)
                ? EnumSet.allOf(PermissionCode.class)
                : user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .collect(java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(PermissionCode.class)));
        var permissions = permissionCodes.stream()
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toCollection(java.util.TreeSet::new));
        var primaryRole = user.getRoles().stream()
                .map(role -> role.getName())
                .sorted(java.util.Comparator.comparingInt(this::rolePriority))
                .findFirst()
                .map(this::roleLabel)
                .orElse("Usuario");
        var specialization = teacherRepository.findByUserId(user.getId())
                .map(teacher -> teacher.getSpecialization())
                .orElse(null);
        return new AuthResponse(
                jwtService.generateAccessToken(principal),
                jwtService.generateRefreshToken(principal),
                user.getUsername(),
                (user.getFirstName() + " " + user.getLastName()).trim(),
                primaryRole,
                specialization,
                user.getInstitution().getId(),
                user.getInstitution().getCode(),
                user.getInstitution().getName(),
                roles,
                permissions);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtService.isRefreshToken(refreshToken) || jwtService.isTokenExpired(refreshToken)) {
            throw new IllegalArgumentException("Refresh token invalido o expirado");
        }
        String username = jwtService.extractUsername(refreshToken);
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        var roles = user.getRoles().stream().map(role -> role.getName()).collect(java.util.stream.Collectors.toSet());
        var permissionCodes = roles.contains(RoleDefaults.ADMINISTRADOR)
                ? EnumSet.allOf(PermissionCode.class)
                : user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .collect(java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(PermissionCode.class)));
        var permissions = permissionCodes.stream()
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toCollection(java.util.TreeSet::new));
        var primaryRole = user.getRoles().stream()
                .map(role -> role.getName())
                .sorted(java.util.Comparator.comparingInt(this::rolePriority))
                .findFirst()
                .map(this::roleLabel)
                .orElse("Usuario");
        var specialization = teacherRepository.findByUserId(user.getId())
                .map(teacher -> teacher.getSpecialization())
                .orElse(null);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), java.util.Collections.emptyList());

        return new AuthResponse(
                jwtService.generateAccessToken(userDetails),
                jwtService.generateRefreshToken(userDetails),
                user.getUsername(),
                (user.getFirstName() + " " + user.getLastName()).trim(),
                primaryRole,
                specialization,
                user.getInstitution().getId(),
                user.getInstitution().getCode(),
                user.getInstitution().getName(),
                roles,
                permissions);
    }

    private int rolePriority(String roleName) {
        return switch (RoleDefaults.normalize(roleName)) {
            case RoleDefaults.ADMINISTRADOR -> 0;
            case RoleDefaults.DOCENTE -> 1;
            case RoleDefaults.ADMINISTRATIVO -> 2;
            case RoleDefaults.ESTUDIANTE -> 3;
            default -> 4;
        };
    }

    private String roleLabel(String roleName) {
        return switch (RoleDefaults.normalize(roleName)) {
            case RoleDefaults.ADMINISTRADOR -> "Administrador";
            case RoleDefaults.DOCENTE -> "Docente";
            case RoleDefaults.ADMINISTRATIVO -> "Administrativo";
            case RoleDefaults.ESTUDIANTE -> "Estudiante";
            default -> roleName.replace("ROLE_", "").replace('_', ' ').trim();
        };
    }
}
