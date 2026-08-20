package com.leccionario.backend.auth.web;

import com.leccionario.backend.auth.dto.AuthRequest;
import com.leccionario.backend.auth.dto.AuthResponse;
import com.leccionario.backend.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${security.jwt.refresh-expiration:604800000}")
    private long refreshExpiration;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);

        Cookie refreshCookie = createRefreshCookie(authResponse.refreshToken());
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(new AuthResponse(
                authResponse.accessToken(),
                null,
                authResponse.username(),
                authResponse.fullName(),
                authResponse.primaryRole(),
                authResponse.specialization(),
                authResponse.institutionId(),
                authResponse.institutionCode(),
                authResponse.institutionName(),
                authResponse.roles(),
                authResponse.permissions()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        AuthResponse authResponse = authService.refreshToken(refreshToken);

        Cookie refreshCookie = createRefreshCookie(authResponse.refreshToken());
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(new AuthResponse(
                authResponse.accessToken(),
                null,
                authResponse.username(),
                authResponse.fullName(),
                authResponse.primaryRole(),
                authResponse.specialization(),
                authResponse.institutionId(),
                authResponse.institutionCode(),
                authResponse.institutionName(),
                authResponse.roles(),
                authResponse.permissions()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie clearCookie = new Cookie("refresh_token", "");
        clearCookie.setHttpOnly(true);
        clearCookie.setSecure(true);
        clearCookie.setPath("/");
        clearCookie.setMaxAge(0);
        response.addCookie(clearCookie);
        return ResponseEntity.ok().build();
    }

    private Cookie createRefreshCookie(String token) {
        Cookie cookie = new Cookie("refresh_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge((int) (refreshExpiration / 1000));
        return cookie;
    }
}
