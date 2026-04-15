package com.leccionario.backend.security;

import com.leccionario.backend.user.domain.PermissionCode;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.user.repository.UserRepository;
import java.util.EnumSet;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        var roleNames = user.getRoles().stream().map(role -> role.getName()).collect(java.util.stream.Collectors.toSet());
        var effectivePermissions = roleNames.contains(RoleDefaults.ADMINISTRADOR)
                ? EnumSet.allOf(PermissionCode.class)
                : user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .collect(java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(PermissionCode.class)));

        var authorities = java.util.stream.Stream.concat(
                        roleNames.stream().map(role -> new SimpleGrantedAuthority(role)),
                        effectivePermissions.stream().map(permission -> new SimpleGrantedAuthority(permission.name())))
                .distinct()
                .toList();

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .disabled(!user.isEnabled())
                .build();
    }
}
